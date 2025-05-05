import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function SearchPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 50;
  const [data, setData] = useState([]);
  const [basicFilters, setBasicFilters] = useState({ adi: "", kaynak_kisi: "", soz: "" });
  const [filters, setFilters] = useState({ yore: "", usul: "", tur: "" });
  const [options, setOptions] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [modalImg, setModalImg] = useState(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/sarkilar`)
      .then(res => res.json())
      .then(records => {
        if (!Array.isArray(records)) {
          console.error("Beklenmeyen veri yapısı:", records);
          return;
        }
        setData(records);
        const keys = ["arsiv_no", "makam", "ton", "sabit_donanim", "gecici_donanim", "ses_genisligi", "derleyen", "notaya_alan", "tur", "yore", "usul", "kaynak_kisi"];
        const generated = {};
        keys.forEach(key => {
          generated[key] = [...new Set(records.map(item => item[key]).filter(Boolean))].sort((a, b) => {
            const numA = parseFloat(a);
            const numB = parseFloat(b);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return String(a).localeCompare(String(b), 'tr');
          });
        });
        setOptions(generated);
      })
      .catch(error => console.error("Veri çekme hatası:", error));
  }, []);

  const handleBasicFilterChange = (field, value) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setBasicFilters(prev => ({ ...prev, [field]: value }));
    }, 300);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setBasicFilters({ adi: "", kaynak_kisi: "", soz: "" });
    setFilters({ yore: "", usul: "", tur: "" });
    setCurrentPage(1);
  };

  const filtered = Array.isArray(data)
    ? data.filter(item =>
        Object.entries(basicFilters).every(([key, val]) =>
          val ? (item[key] || "").toLowerCase().includes(val.toLowerCase()) : true
        ) &&
        Object.entries(filters).every(([key, val]) =>
          val ? item[key] === val : true
        )
      )
    : [];

  const currentPageData = filtered.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);

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
        {["adi", "kaynak_kisi", "soz"].map(field => (
          <input
            key={field}
            type="text"
            placeholder={field}
            value={basicFilters[field]}
            onChange={e => handleBasicFilterChange(field, e.target.value)}
            className="border p-2 rounded"
          />
        ))}

        {["yore", "usul", "tur"].map(field => (
          <select
            key={field}
            value={filters[field]}
            onChange={e => handleFilterChange(field, e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">{field.toUpperCase()}</option>
            {(options[field] || []).map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        ))}
      </div>

      <div className="flex gap-2 mb-2">
        <button onClick={handleReset}>Sıfırla</button>
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

      <p className="mt-2">Toplam {filtered.length} sonuç bulundu</p>
      <div className="mt-2 flex gap-2">
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>← Geri</button>
        <span>Sayfa {currentPage} / {Math.ceil(filtered.length / resultsPerPage)}</span>
        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage * resultsPerPage >= filtered.length}>İleri →</button>
      </div>
    </div>
  );
}
