import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function SearchPage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({ adi: "", soz: "", yore: "", kaynak_kisi: "", usul: "" });
  const [options, setOptions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [modalImg, setModalImg] = useState(null);
  const resultsPerPage = 50;
  const debounceTimer = useRef(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/sarkilar`)
      .then(res => res.json())
      .then(records => {
        setData(records);
        setFilteredData(records);

        const keys = ["yore", "usul", "kaynak_kisi"];
        const generated = {};
        keys.forEach(key => {
          generated[key] = [...new Set(records.map(item => item[key]).filter(Boolean))].sort((a, b) =>
            a.localeCompare(b, "tr")
          );
        });
        setOptions(generated);
      });
  }, []);

  useEffect(() => {
    let result = [...data];

    result = result.filter(item =>
      Object.entries(filters).every(([key, val]) => {
        if (!val) return true;
        const content = (item[key] || "").toLowerCase();
        if (key === "soz") {
          return val.toLowerCase().split(" ").every(k => content.includes(k));
        }
        return content.includes(val.toLowerCase());
      })
    );

    setFilteredData(result);
    setCurrentPage(1);
  }, [filters, data]);

  const handleFilterChange = (field, value) => {
    if (["adi", "soz"].includes(field)) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setFilters(prev => ({ ...prev, [field]: value }));
      }, 300);
    } else {
      setFilters(prev => ({ ...prev, [field]: value }));
    }
  };

  const clearAllFilters = () => {
    setFilters({ adi: "", soz: "", yore: "", kaynak_kisi: "", usul: "" });
  };

  const currentPageData = filteredData.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("THM Sözlü Arşiv", 10, 10);
    autoTable(doc, {
      startY: 20,
      head: [["Adı", "Yöre", "Usul"]],
      body: currentPageData.map(i => [i.adi, i.yore, i.usul])
    });
    doc.save("thm-arsiv.pdf");
  };

  const handleExportXLS = () => {
    const ws = XLSX.utils.json_to_sheet(currentPageData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Şarkılar");
    XLSX.writeFile(wb, "thm-arsiv.xlsx");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🎵 THM Sözlü Arşiv Arama Sistemi</h1>

      <div className="flex flex-wrap gap-2 mb-2">
        <input placeholder="adi" className="border p-2 rounded" value={filters.adi} onChange={e => handleFilterChange("adi", e.target.value)} />
        {["yore", "kaynak_kisi", "usul"].map(field => (
          <select key={field} className="border p-2 rounded" value={filters[field]} onChange={e => handleFilterChange(field, e.target.value)}>
            <option value="">{field.toUpperCase()}</option>
            {(options[field] || []).map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        ))}
        <input placeholder="soz" className="border p-2 rounded" value={filters.soz} onChange={e => handleFilterChange("soz", e.target.value)} />
      </div>

      <div className="flex gap-2 mb-2">
        <button onClick={clearAllFilters}>Sıfırla</button>
        <button onClick={handleExportPDF}>PDF Aktar</button>
        <button onClick={handleExportXLS}>XLS Aktar</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th>#</th>
              <th>Adı</th>
              <th>Yöre</th>
              <th>Usul</th>
              <th>Nota</th>
              <th>MP3</th>
            </tr>
          </thead>
          <tbody>
            {currentPageData.map((item, idx) => (
              <tr key={idx}>
                <td>{(currentPage - 1) * resultsPerPage + idx + 1}</td>
                <td>{item.adi}</td>
                <td>{item.yore}</td>
                <td>{item.usul}</td>
                <td><button onClick={() => setModalImg(`/nota/${item.nota_gorseli}`)}>Görüntüle</button></td>
                <td><a href={`/mp3/${item.mp3}`}>{item.mp3 ? "Dinle" : "-"}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalImg && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={() => setModalImg(null)}>
          <div className="bg-white p-4 rounded shadow-lg max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <img src={modalImg} alt="Nota Görseli" className="w-full h-auto" />
            <button className="mt-2 text-sm text-blue-600 underline" onClick={() => setModalImg(null)}>Kapat</button>
          </div>
        </div>
      )}

      <p className="mt-2">Toplam {filteredData.length} sonuç bulundu</p>
      <div className="mt-2 flex gap-2">
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>←</button>
        <span>Sayfa {currentPage}</span>
        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage * resultsPerPage >= filteredData.length}>→</button>
      </div>
    </div>
  );
}
