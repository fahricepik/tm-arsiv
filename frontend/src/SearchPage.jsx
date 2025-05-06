import React, { useEffect, useState } from "react";
import axios from "axios";

const SearchPage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [yoreFilter, setYoreFilter] = useState("");
  const [kaynakKisiFilter, setKaynakKisiFilter] = useState("");
  const [usulFilter, setUsulFilter] = useState("");
  const [sozFilter, setSozFilter] = useState("");
  const [selectedNota, setSelectedNota] = useState(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/sarkilar`)
      .then((res) => {
        setData(res.data.sarkilar);
        setFilteredData(res.data.sarkilar);
      })
      .catch((err) => console.error("Veri çekme hatası:", err));
  }, []);

  useEffect(() => {
    let filtered = data.filter((item) => {
      return (
        item.adi.toLowerCase().includes(searchTerm.toLowerCase()) &&
        item.yore.toLowerCase().includes(yoreFilter.toLowerCase()) &&
        item.kaynak_kisi.toLowerCase().includes(kaynakKisiFilter.toLowerCase()) &&
        item.usul.toLowerCase().includes(usulFilter.toLowerCase()) &&
        item.soz.toLowerCase().includes(sozFilter.toLowerCase())
      );
    });
    setFilteredData(filtered);
  }, [searchTerm, yoreFilter, kaynakKisiFilter, usulFilter, sozFilter, data]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">🎵 THM Sözlü Arşiv Arama Sistemi</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="adi"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="YORE"
          value={yoreFilter}
          onChange={(e) => setYoreFilter(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="KAYNAK_KISI"
          value={kaynakKisiFilter}
          onChange={(e) => setKaynakKisiFilter(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="USUL"
          value={usulFilter}
          onChange={(e) => setUsulFilter(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="soz"
          value={sozFilter}
          onChange={(e) => setSozFilter(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <table className="table-auto w-full border-collapse border border-gray-400">
        <thead className="sticky top-0 bg-purple-100 text-purple-800">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">Adı</th>
            <th className="border p-2">Yöre</th>
            <th className="border p-2">Usul</th>
            <th className="border p-2">Nota</th>
            <th className="border p-2">MP3</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2">{item.adi}</td>
              <td className="border p-2">{item.yore}</td>
              <td className="border p-2">{item.usul}</td>
              <td className="border p-2">
                {item.nota_gorseli !== "=" ? (
                  <button
                    className="bg-gray-200 px-2 py-1 rounded"
                    onClick={() => setSelectedNota(`/${item.nota_gorseli}`)}
                  >
                    Görüntüle
                  </button>
                ) : (
                  "-"
                )}
              </td>
              <td className="border p-2">
                {item.mp3 !== "=" ? (
                  <a href={`/${item.mp3}`} target="_blank" rel="noopener noreferrer">
                    Dinle
                  </a>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Nota Görseli */}
      {selectedNota && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
          onClick={() => setSelectedNota(null)}
        >
          <div
            className="bg-white p-4 rounded shadow-lg max-w-[90%] max-h-[90%] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedNota}
              alt="Nota Görseli"
              className="max-w-full max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
