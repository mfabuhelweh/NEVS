import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

// Initialize Firebase Admin
// In Cloud Run, it will use default credentials if no cert is provided.
const adminApp = initializeApp({
  projectId: firebaseConfig.projectId
});

// Use the named database if provided, otherwise use the default one.
const db = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId || "(default)");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  app.get("/api/health", async (req, res) => {
    try {
      const namedDb = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
      const defaultDb = getFirestore(adminApp);
      
      const namedResult = await namedDb.collection("tokens").limit(1).get().then(() => "OK").catch(e => e.message);
      const defaultResult = await defaultDb.collection("tokens").limit(1).get().then(() => "OK").catch(e => e.message);
      
      console.log(`[HEALTH CHECK] Named DB (${firebaseConfig.firestoreDatabaseId}): ${namedResult}`);
      console.log(`[HEALTH CHECK] Default DB: ${defaultResult}`);
      
      res.json({ namedResult, defaultResult, databaseId: firebaseConfig.firestoreDatabaseId });
    } catch (error) {
      res.status(500).json({ status: "error", error: String(error) });
    }
  });
  // 1. Token Validation
  app.post("/api/auth/token", async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token is required" });

    try {
      const tokenDoc = await db.collection("tokens").doc(token).get();
      if (!tokenDoc.exists) return res.status(404).json({ error: "Invalid token" });

      const tokenData = tokenDoc.data();
      if (tokenData?.used) return res.status(403).json({ error: "Token already used" });
      if (tokenData?.expiryTime.toDate() < new Date()) return res.status(403).json({ error: "Token expired" });

      // Generate OTP if not already generated
      let otp = tokenData?.otp;
      if (!otp) {
        otp = Math.floor(100000 + Math.random() * 900000).toString();
        await db.collection("tokens").doc(token).update({ otp });
        console.log(`[SIMULATION] Sending OTP ${otp} to voter ${tokenData?.voterId}`);
      }

      res.json({ voterId: tokenData?.voterId, otpVerified: tokenData?.otpVerified });
    } catch (error) {
      console.error("Token validation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // 2. OTP Verification
  app.post("/api/auth/verify-otp", async (req, res) => {
    const { token, otp } = req.body;
    if (!token || !otp) return res.status(400).json({ error: "Token and OTP are required" });

    try {
      const tokenDoc = await db.collection("tokens").doc(token).get();
      if (!tokenDoc.exists) return res.status(404).json({ error: "Invalid token" });

      const tokenData = tokenDoc.data();
      if (tokenData?.otp === otp) {
        await db.collection("tokens").doc(token).update({ otpVerified: true });
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid OTP" });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // 3. Voting (One-vote-only logic)
  app.post("/api/vote", async (req, res) => {
    const { token, electionId, listId, candidateIds, districtId } = req.body;
    if (!token) return res.status(400).json({ error: "Token is required" });

    try {
      const tokenDoc = await db.collection("tokens").doc(token).get();
      if (!tokenDoc.exists) return res.status(404).json({ error: "Invalid token" });

      const tokenData = tokenDoc.data();
      if (tokenData?.used) return res.status(403).json({ error: "Token already used" });
      if (!tokenData?.otpVerified) return res.status(403).json({ error: "OTP not verified" });
      if (tokenData?.expiryTime.toDate() < new Date()) return res.status(403).json({ error: "Token expired" });

      const voterId = tokenData?.voterId;
      const voterRef = db.collection("voters_registry").doc(voterId);
      const voterDoc = await voterRef.get();

      if (!voterDoc.exists) return res.status(404).json({ error: "Voter not found" });
      if (voterDoc.data()?.status === "voted") return res.status(403).json({ error: "Voter already voted" });

      // Atomic transaction for voting
      await db.runTransaction(async (transaction) => {
        const voteId = uuidv4();
        const voteRef = db.collection("elections").doc(electionId).collection("votes").doc(voteId);
        
        // 1. Create vote
        transaction.set(voteRef, {
          id: voteId,
          electionId,
          listId,
          candidateIds,
          districtId,
          timestamp: FieldValue.serverTimestamp(),
        });

        // 2. Update voter status
        transaction.update(voterRef, { status: "voted", hasVoted: true });

        // 3. Mark token as used
        transaction.update(db.collection("tokens").doc(token), { used: true });

        // 4. Update election/candidate/list counts
        const electionRef = db.collection("elections").doc(electionId);
        transaction.update(electionRef, { totalVotes: FieldValue.increment(1) });

        const listRef = db.collection("elections").doc(electionId).collection("lists").doc(listId);
        transaction.update(listRef, { votes: FieldValue.increment(1) });

        for (const cid of candidateIds) {
          const candidateRef = db.collection("elections").doc(electionId).collection("candidates").doc(cid);
          transaction.update(candidateRef, { votes: FieldValue.increment(1) });
        }
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Voting error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Scheduler Simulation
  const SCHEDULER_INTERVAL = 1000 * 60 * 60; // 1 hour
  
  setInterval(async () => {
    console.log("[SCHEDULER] Running hourly tasks...");
    
    try {
      // 1. Select 50 random pending/expired voters
      const pendingVoters = await db.collection("voters_registry")
        .where("status", "in", ["pending", "expired"])
        .limit(50)
        .get();

      if (!pendingVoters.empty) {
        console.log(`[SCHEDULER] Found ${pendingVoters.size} voters to invite.`);
        const batch = db.batch();
        const now = new Date();
        const expiry = new Date(now.getTime() + 1000 * 60 * 60); // 1 hour from now

        pendingVoters.forEach(doc => {
          const voterId = doc.id;
          const token = uuidv4();
          
          // Create token
          const tokenRef = db.collection("tokens").doc(token);
          batch.set(tokenRef, {
            id: token,
            voterId,
            expiryTime: Timestamp.fromDate(expiry),
            used: false,
            otpVerified: false
          });

          // Update voter status
          batch.update(doc.ref, { status: "invited" });
          
          console.log(`[SIMULATION] Sending invitation link to ${doc.data().email}: /vote?token=${token}`);
        });

        await batch.commit();
      }

      // 2. Auto-expiry for invited voters
      const invitedVoters = await db.collection("voters_registry")
        .where("status", "==", "invited")
        .get();

      if (!invitedVoters.empty) {
        const batch = db.batch();
        let expiredCount = 0;

        for (const voterDoc of invitedVoters.docs) {
          const voterId = voterDoc.id;
          // Find the active token for this voter
          const tokens = await db.collection("tokens")
            .where("voterId", "==", voterId)
            .where("used", "==", false)
            .get();

          let allExpired = true;
          tokens.forEach(t => {
            if (t.data().expiryTime.toDate() > new Date()) {
              allExpired = false;
            }
          });

          if (allExpired && !tokens.empty) {
            batch.update(voterDoc.ref, { status: "expired" });
            expiredCount++;
          }
        }

        if (expiredCount > 0) {
          await batch.commit();
          console.log(`[SCHEDULER] Marked ${expiredCount} voters as expired.`);
        }
      }

    } catch (error) {
      console.error("[SCHEDULER] Error:", error);
    }
  }, SCHEDULER_INTERVAL);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
