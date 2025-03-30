import axios from "axios";
//trigger build
// export default axios.create({
//   baseURL: "https://bcat-server.vercel.app/",
//   withCredentials: true,
// });

export default axios.create({
  baseURL:
    import.meta.env.VITE_ENVIRONMENT == "local"
      ? "http://localhost:3500"
      : "https://management.getbcat.com/",
  withCredentials: true,
});
