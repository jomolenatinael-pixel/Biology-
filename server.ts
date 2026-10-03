import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      deck: "Cell Biology & Cellular Respiration",
    });
  });

  // API: Q-Chat AI Tutor endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const client = getGeminiClient();

      if (!client) {
        // Fallback intelligent bio response generator if key is not yet set
        const lower = message.toLowerCase();
        let fallbackReply = "I am your Biology 101 AI tutor! Let's explore cellular respiration or cell organelles.";

        if (lower.includes("chemiosmosis") || lower.includes("atp synthase")) {
          fallbackReply = "Chemiosmosis is the coupling of the proton (H+) electrochemical gradient across the inner mitochondrial membrane to the mechanical rotation of ATP Synthase! As H+ flows down its concentration gradient back into the mitochondrial matrix through ATP Synthase, ADP is phosphorylated into ATP. Think of it like water turning a hydroelectric turbine.";
        } else if (lower.includes("glycolysis")) {
          fallbackReply = "Glycolysis takes place in the cytosol and is completely anaerobic (doesn't require oxygen). It splits 1 glucose (6 carbons) into 2 pyruvates (3 carbons each). The energy tally: it invests 2 ATP, generates 4 ATP via substrate-level phosphorylation, yielding a NET 2 ATP and 2 NADH.";
        } else if (lower.includes("krebs") || lower.includes("citric acid")) {
          fallbackReply = "The Krebs Cycle (Citric Acid Cycle) takes place in the mitochondrial matrix. For each acetyl-CoA that enters, it produces 3 NADH, 1 FADH2, 1 ATP (or GTP), and releases 2 CO2 as waste. Since 1 glucose yields 2 acetyl-CoA molecules, double those numbers per glucose!";
        } else if (lower.includes("etc") || lower.includes("electron transport")) {
          fallbackReply = "The Electron Transport Chain (ETC) sits in the inner mitochondrial membrane (cristae). Complex I and II accept electrons from NADH and FADH2, passing them through ubiquinone (Q), Complex III, cytochrome c, and Complex IV to molecular oxygen (O2) — the terminal electron acceptor — producing H2O. This electron flow powers proton pumping into the intermembrane space.";
        } else if (lower.includes("quiz") || lower.includes("test me")) {
          fallbackReply = "Here is a quick quiz question for you: Where in the eukaryotic cell does the transition step (pyruvate oxidation) take place, and what molecule does pyruvate convert into before entering the Krebs cycle? Reply with your guess!";
        } else if (lower.includes("mnemonic") || lower.includes("remember")) {
          fallbackReply = "Here are two classic mnemonics:\n1. **OIL RIG**: Oxidation Is Loss (of electrons/H), Reduction Is Gain.\n2. **Mighty Mitochondria**: Powerhouse that converts food nutrients into high-yield cellular currency (ATP)!";
        }

        return res.json({
          reply: fallbackReply,
          source: "local-tutor-engine",
        });
      }

      // Multi-model resilience: try fast flash-lite, fallback to 3.8-flash or flash-latest if high demand (503) occurs
      const CANDIDATE_MODELS = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
      const systemInstruction = `You are Dr. Elena Vance's interactive AI Biology Tutor for the Harvard Bio 101 course on "Cell Biology & Cellular Respiration".
Your expertise covers:
- Glycolysis, Pyruvate Oxidation, Citric Acid Cycle (Krebs), Electron Transport Chain (ETC), Chemiosmosis & ATP Synthase
- Fermentation (Lactic acid vs Alcoholic)
- Cell Organelles: Mitochondria, ER, Golgi, Lysosomes, Ribosomes, Cytoskeleton, Peroxisomes
- Membrane Transport: Osmosis, Facilitated Diffusion, Active Transport (Na+/K+ pump), Endocytosis/Exocytosis
- Photosynthesis comparison: Light reactions, Calvin Cycle, Chloroplast vs Mitochondria

Guidelines:
- Give concise, encouraging, scientifically rigorous yet accessible explanations.
- Use bullet points, bold keywords, and biochemical analogies when helpful.
- When the user asks to be quizzed, give one challenging Bio 101 question at a time and evaluate their reply.`;

      let replyText: string | null = null;
      let usedModel: string | null = null;

      for (const model of CANDIDATE_MODELS) {
        try {
          const response = await client.models.generateContent({
            model,
            contents: [
              ...(history || []).map((h: { sender: string; text: string }) => ({
                role: h.sender === "user" ? "user" : "model",
                parts: [{ text: h.text }],
              })),
              { role: "user", parts: [{ text: message }] },
            ],
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });

          if (response.text) {
            replyText = response.text;
            usedModel = model;
            break;
          }
        } catch (modelErr: any) {
          console.warn(`Model ${model} unavailable or busy (${modelErr?.status || modelErr?.message?.slice(0, 50)}). Trying fallback...`);
        }
      }

      if (replyText) {
        return res.json({
          reply: replyText,
          source: usedModel,
        });
      }

      // If all cloud models are busy/experiencing temporary demand spikes, return intelligent bio curriculum answer
      const lower = message.toLowerCase();
      let fallbackReply = "I understand your question about cell biology. In cellular respiration, glucose is oxidized step-by-step through glycolysis, pyruvate oxidation, the citric acid cycle, and oxidative phosphorylation to yield ATP. Which specific phase would you like to examine in detail?";

      if (lower.includes("chemiosmosis") || lower.includes("atp synthase")) {
        fallbackReply = "Chemiosmosis couples the proton (H+) electrochemical gradient across the inner mitochondrial membrane to the mechanical rotation of ATP Synthase! As H+ flows down its concentration gradient back into the mitochondrial matrix through ATP Synthase, ADP is phosphorylated into ATP.";
      } else if (lower.includes("glycolysis")) {
        fallbackReply = "Glycolysis takes place in the cytosol and is anaerobic. It splits 1 glucose (6C) into 2 pyruvates (3C). The energy tally: invests 2 ATP, generates 4 ATP via substrate-level phosphorylation, yielding a NET 2 ATP and 2 NADH.";
      } else if (lower.includes("krebs") || lower.includes("citric acid")) {
        fallbackReply = "The Krebs Cycle (Citric Acid Cycle) takes place in the mitochondrial matrix. For each acetyl-CoA, it yields 3 NADH, 1 FADH2, 1 ATP (or GTP), and 2 CO2. Double those yields per glucose molecule!";
      } else if (lower.includes("etc") || lower.includes("electron transport")) {
        fallbackReply = "The Electron Transport Chain (ETC) sits in the inner mitochondrial membrane (cristae). High-energy electrons from NADH and FADH2 flow down Complexes I-IV to oxygen (the terminal acceptor), pumping protons into the intermembrane space.";
      }

      return res.json({
        reply: fallbackReply,
        source: "curriculum-tutor-fallback",
      });
    } catch (err: any) {
      return res.status(200).json({
        reply: "Let's review this concept together. Feel free to ask about glycolysis, the Krebs cycle, electron transport chain, or cellular structures!",
        source: "offline-tutor",
      });
    }
  });

  // Vite development middleware or static production serve
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
