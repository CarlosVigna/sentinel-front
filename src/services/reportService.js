import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/reports`;

export const getTextReport = async () => {
  const response = await axios.get(`${API_URL}/text`);
  return response.data;
};

export const downloadPdfReport = async () => {
  const response = await axios.get(`${API_URL}/pdf`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", "relatorio.pdf");
  document.body.appendChild(link);
  link.click();
};