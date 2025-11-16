import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

// biar bisa baca req.body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Koneksi MongoDB
const client = new MongoClient(process.env.MONGO_URI);

async function startServer() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected");

    const db = client.db("toko_konter");
    const produk = db.collection("produk");

    // ➜ GET HOME
    app.get("/", async (req, res) => {
      const dataProduk = await produk.find().toArray();
      res.render("index", { activePage: "product", dataProduk });
    });

    // ➜ GET PRODUCT
    app.get("/product", async (req, res) => {
      const dataProduk = await produk.find().toArray();
      res.render("index", { activePage: "product", dataProduk });
    });

    // ➜ POST PRODUCT
    app.post("/product", async (req, res) => {
      const { productName, productPrice, productStock } = req.body;

      await produk.insertOne({
        name: productName,
        price: Number(productPrice.replace(/\./g, "")),
        stock: Number(productStock.replace(/\./g, "")),
        createdAt: new Date(),
      });

      res.redirect("/product");
    });

    // ➜ DELETE PRODUCT
    app.delete("/product/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await produk.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
          res.json({ success: true });
        } else {
          res
            .status(404)
            .json({ success: false, message: "Produk tidak ditemukan" });
        }
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });

    // ➜ UPDATE PRODUCT (PUT untuk edit harga & stok)
app.put("/product/:id", async (req, res) => {
  const { id } = req.params;
  const { price, stock } = req.body;

  console.log("ID:", id, "Body:", req.body);

  try {
    if (price === undefined || stock === undefined) {
      return res.json({
        success: false,
        message: "Price atau Stock tidak boleh kosong",
      });
    }

    const result = await produk.updateOne(
      { _id: new ObjectId(id) },
      { $set: { price: Number(price), stock: Number(stock) } }
    );

    if (result.modifiedCount === 1) {
      res.json({ success: true });
    } else {
      res.json({
        success: false,
        message: "Produk tidak ditemukan atau data sama",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal update produk" });
  }
});




    // START SERVER
    app.listen(3000, () => {
      console.log("🚀 Server running at http://localhost:3000");
    });
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
  }
}

startServer();
