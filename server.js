import express from "express"
const app = express()

app.set("view engine", "ejs")
app.use(express.static("public"))

app.get("/", (req, res) => {
  res.render("index", { activePage: "product" });
});
app.get("/product", (req, res) => {
  res.render("index", { activePage: "product" });
});



app.listen(3000, () => {
  console.log("Server berjalan di http://localhost:3000");
});