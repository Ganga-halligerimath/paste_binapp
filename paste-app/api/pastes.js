export default function handler(req, res) {
  if (req.method === "POST") {
    return res.status(200).json({
      message: "API is working ✅"
    });
  }

  res.status(405).json({ error: "Method not allowed" });
}