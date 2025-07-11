const binaryData = new Uint8Array(e.target.result);
const fileName = file.name.split(".")[0]; // name without extension
const fileType = file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "txt";
let base64String = "";
const bytes = new Uint8Array(e.target.result);
const len = bytes.byteLength;
for (let i = 0; i < len; i++) {
  base64String += String.fromCharCode(bytes[i]);
}
const base64 = btoa(base64String);
