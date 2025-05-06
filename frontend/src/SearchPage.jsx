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
  const [dropdownOptions, setDropdownOptions] = useState({ yore: [], kaynak_kisi: [], usul: [] });

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/sarkilar`)
      .then((res) => {
        const songs = res.data.sarkilar;
        setData(songs);
        setFilteredData(songs);

        const extractSorted = (field) => {
          const values = Array.from(new Set(songs.map(item => item[field]).filter(Boolean)));
          if (field === "usul") {
            return values.sort((a, b) => {
              const parseFirstNumber = (val) => parseFloat(val.split(/[,\/]/)[0]);
              return parseFirstNumber(a) - parseFirstNumber(b);
            });
          }
          return values.sort((a, b) => a.localeCompare(b, "tr"));
        };

        setDropdownOptions({
          yore: extractSorted("yore"),
          kaynak_kisi: extractSorted("kaynak_kisi"),
          usul: extractSorted("usul")
        });
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
        <select
          value={yoreFilter}
          onChange={(e) => setYoreFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">YORE</option>
          {dropdownOptions.yore.map((option, i) => (
            <option key={i} value={option}>{option}</option>
          ))}
        </select>
        <select
          value={kaynakKisiFilter}
          onChange={(e) => setKaynakKisiFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">KAYNAK_KISI</option>
          {dropdownOptions.kaynak_kisi.map((option, i) => (
            <option key={i} value={option}>{option}</option>
          ))}
        </select>
        <select
          value={usulFilter}
          onChange={(e) => setUsulFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">USUL</option>
          {dropdownOptions.usul.map((option, i) => (
            <option key={i} value={option}>{option}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="soz"
          value={sozFilter}
          onChange={(e) => setSozFilter(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <table className="table-auto w-full border-collapse border border-gray-400">
        <thead className="sticky top-0 bg-purple-200 text-purple-900 z-10">
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
                  <a
                    href={item.nota_gorseli}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-200 px-2 py-1 rounded inline-block text-center"
                  >
                    Görüntüle
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td className="border p-2">
                {item.mp3 !== "=" ? (
                  <a
                    href={`/${item.mp3}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
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
    </div>
  );
};
export default SearchPage;
