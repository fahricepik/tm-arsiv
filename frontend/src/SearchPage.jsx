import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function SearchPage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [basicFilters, setBasicFilters] = useState({ adi: "", soz: "", kaynak_kisi: "" });
  const [advancedFilters, setAdvancedFilters] = useState({ yore: "", usul: "", tur: "", makam: "", ton: "" });
  const [options, setOptions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 50;
  const debounceTimer = useRef(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/sarkilar`)
      .then(res => res.json())
      .then(records => {
        setData(records);
        setFilteredData(records);

        const keys = ["yore", "usul", "tur", "makam", "ton"];
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
      Object.entries(basicFilters).every(([key, val]) => {
        if (!val) return true;
        if (key === "soz") {
          const kelimeler = val.toLowerCase().split(" ");
          return kelimeler.every(kelime => (item.soz || "").toLowerCase().includes(kelime));
        }
        return (item[key] || "").toLowerCase().includes(val.toLowerCase());
      }) &&
      Object.entries(advancedFilters).every(([key, val]) => (val ? item[key] === val : true))
    );

    setFilteredData(result);
    setCurrentPage(1);
  }, [basicFilters, advancedFilters, data]);

  const handleBasicFilterChange = (field, value) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setBasicFilters(prev => ({ ...prev, [field]: value }));
    }, 300);
  };

  const handleAdvancedFilterChange = (field, value) => {
    setAdvancedFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearAllFilters = () => {
    setBasicFilters({ adi: "", soz: "", kaynak_kisi: "" });
    setAdvancedFilters({ yore: "", usul: "", tur: "", makam: "", ton: "" });
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
      <h1 className="text-2xl font-bold mb-4">🎵 THM Arama Sistemi</h1>

      <div className="flex flex-wrap gap-2 mb-2">
        {["adi", "soz", "kaynak_kisi"].map(field => (
          <input
            key={field}
            placeholder={field}
            className="border p-2 rounded"
            value={basicFilters[field]}
            onChange={e => handleBasicFilterChange(field, e.target.value)}
          />
        ))}

        {["yore", "usul", "tur", "makam", "ton"].map(field => (
          <select
            key={field}
            className="border p-2 rounded"
            value={advancedFilters[field]}
            onChange={e => handleAdvancedFilterChange(field, e.target.value)}
          >
            <option value="">{field.toUpperCase()}</option>
            {(options[field] || []).map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        ))}
      </div>

      <div className="mb-2">
        {[...Object.entries(basicFilters), ...Object.entries(advancedFilters)]
          .filter(([_, val]) => val)
          .map(([key, val], i) => (
            <span key={i} className="border p-1 mr-1 text-sm rounded">
              {key}: {val}
              <button onClick={() => {
                if (basicFilters[key] !== undefined) setBasicFilters(prev => ({ ...prev, [key]: "" }));
                if (advancedFilters[key] !== undefined) setAdvancedFilters(prev => ({ ...prev, [key]: "" }));
              }}> ×</button>
            </span>
        ))}
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
                <td><a href={item.nota_gorseli}>{item.nota_gorseli ? "Görüntüle" : "-"}</a></td>
                <td><a href={item.mp3}>{item.mp3 ? "Dinle" : "-"}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2">Toplam {filteredData.length} sonuç bulundu</p>
      <div className="mt-2 flex gap-2">
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>←</button>
        <span>Sayfa {currentPage}</span>
        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage * resultsPerPage >= filteredData.length}>→</button>
      </div>
    </div>
  );
}
