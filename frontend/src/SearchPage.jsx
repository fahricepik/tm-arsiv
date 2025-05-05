import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function SearchPage() {
    const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 50;
  const [data, setData] = useState([]);
  const [basicFilters, setBasicFilters] = useState({ adi: "", yore: "", usul: "", kaynak_kisi: "", soz: "" });
  const [filters, setFilters] = useState({});
  const [options, setOptions] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [modalImg, setModalImg] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/sarkilar`)
      .then(res => res.json())
      .then(records => {
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
      });
  }, []);

  const debounceTimer = useRef(null);
  const handleBasicFilterChange = (field, value) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setBasicFilters(prev => ({ ...prev, [field]: value }));
    }, 300);
  };
  const handleFilterChange = (field, value) => setFilters(prev => ({ ...prev, [field]: value }));
  const handleReset = () => {
    setBasicFilters({ adi: "", yore: "", usul: "", kaynak_kisi: "", soz: "" });
    setFilters({});
    setCurrentPage(1);
  };
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("THM Sözlü Arşiv", 10, 10);
    autoTable(doc, {
      startY: 20,
      head: [["Adı", "Yöre", "Usul"]],
      body: filtered.map(i => [i.adi, i.yore, i.usul])
    });
    doc.save("thm-arsiv.pdf");
  };

  const handleExportXLS = () => {
    const today = new Date().toISOString().slice(0, 10);
    const headers = ["arsiv_no", "adi", "yore", "usul", "kaynak_kisi", "tur", "makam", "ton", "sabit_donanim", "gecici_donanim", "ses_genisligi"];
    const rows = filtered.map(row =>
      headers.reduce((acc, h) => {
        acc[h] = row[h] ?? "";
        return acc;
      }, {})
    );
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sonuclar");
    XLSX.writeFile(workbook, `thm_sonuclar_${today}.xlsx`);
  };

  const filtered = data.filter(item => {
    const basicMatch = Object.entries(basicFilters).every(([key, val]) => item[key]?.toLowerCase()?.includes(val.toLowerCase()));
    const detailedMatch = Object.entries(filters).every(([key, val]) => !val || item[key]?.toLowerCase?.() === val.toLowerCase());
    return basicMatch && detailedMatch;
  });

  const totalPages = Math.ceil(filtered.length / resultsPerPage);
  const paginatedResults = filtered.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);

  return (
    <div className="min-h-screen bg-white text-black">
            <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-purple-700 mb-6">🎵 THM Sözlü Arşiv Arama Sistemi</h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
          {Object.keys(basicFilters).map(field => (
            ["yore", "usul", "kaynak_kisi"].includes(field) && options[field] ? (
              <select
                key={field}
                value={basicFilters[field]}
                onChange={(e) => handleBasicFilterChange(field, e.target.value)}
                className="border border-purple-300 p-2 rounded"
              >
                <option value="">{field.replace(/_/g, " ").replace(/^./, s => s.toUpperCase())}</option>
                {options[field].sort((a, b) => {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
  return String(a).localeCompare(String(b), 'tr');
}).map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            ) : (
              <input
                key={field}
                type="text"
                value={basicFilters[field]}
                onChange={(e) => handleBasicFilterChange(field, e.target.value)}
                placeholder={field.replace(/_/g, " ").replace(/^./, s => s.toUpperCase())}
                className="border border-purple-300 p-2 rounded"
              />
            )
          ))}
        </div>

        <div className="h-6" />

        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {Object.entries({ ...basicFilters, ...filters })
            .filter(([, val]) => val)
            .map(([key, val]) => (
              <span key={key} className="bg-purple-100 border border-purple-300 text-purple-800 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                {key.replace(/_/g, " ").replace(/^./, s => s.toUpperCase())}: {val}
                <button
                  onClick={() => {
                    if (basicFilters.hasOwnProperty(key)) {
                      setBasicFilters(prev => ({ ...prev, [key]: "" }));
                    } else {
                      setFilters(prev => ({ ...prev, [key]: "" }));
                    }
                  }}
                  className="ml-1 text-purple-600 hover:text-purple-900"
                >×</button>
              </span>
            ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="bg-purple-200 text-purple-800 px-4 py-2 rounded shadow hover:bg-purple-300 transition">
            {showAdvanced ? "Detaylı Aramayı Gizle" : "Detaylı Aramayı Göster"}
          </button>
          <button onClick={handleReset} className="bg-purple-200 text-purple-800 px-4 py-2 rounded shadow hover:bg-purple-300 transition">Tümünü Sıfırla</button>
          <button onClick={handleExportPDF} className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 transition">PDF Aktar</button>
          <button onClick={handleExportXLS} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition">XLS Aktar</button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(options)
              .filter(([key]) => !["yore", "usul", "kaynak_kisi"].includes(key))
              .sort((a, b) => {
                const order = ["arsiv_no", "makam", "ton", "sabit_donanim", "gecici_donanim", "ses_genisligi", "derleyen", "notaya_alan", "tur"];
                return order.indexOf(a[0]) - order.indexOf(b[0]);
              })
              .map(([key, values]) => (
                <select
                  key={key}
                  value={filters[key] || ""}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  className="border border-purple-300 p-2 rounded"
                >
                  <option value="">{key.replace(/_/g, " ").replace(/^./, s => s.toUpperCase())}</option>
                  {values.sort((a, b) => {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
  return String(a).localeCompare(String(b), 'tr');
}).map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              ))}
          </div>
        )}

        <div className="mt-12 overflow-auto">
          <table className="w-full border text-sm rounded-lg shadow">
            <thead className="sticky top-0 bg-purple-200 text-purple-900 font-bold text-sm z-10 shadow">
              <tr>
                <th className="border px-2 py-1 text-left">#</th>
                <th className="border px-2 py-1 text-left">Adı</th>
                <th className="border px-2 py-1 text-left">Yöre</th>
                <th className="border px-2 py-1 text-left">Usul</th>
                <th className="border px-2 py-1 text-left">Nota Görseli</th>
                <th className="border px-2 py-1 text-left">MP3</th>
              </tr>
            </thead>
            <tbody>
              {paginatedResults.map((item, index) => (
                <tr key={item.id || index} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-2 py-1">{(currentPage - 1) * resultsPerPage + index + 1}</td>
                  <td className="border px-2 py-1">{item.adi}</td>
                  <td className="border px-2 py-1">{item.yore}</td>
                  <td className="border px-2 py-1">{item.usul}</td>
                  <td className="border px-2 py-1 text-center">
                    {item.nota && (
                      <button
                        onClick={() => {
                          const width = 500;
                          const height = 707;
                          const left = (window.innerWidth - width) / 2;
                          const top = (window.innerHeight - height) / 2;
                          window.open(item.nota, '_blank', `width=${width},height=${height},left=${left},top=${top}`);
                        }}
                        className="hover:scale-105 transition-transform text-xl"
                        title="Nota Görselini Aç"
                      >
                        <span role="img" aria-label="nota">🎶</span>
                      </button>
                    )}
                  </td>
                  <td className="border px-2 py-1">
                    {item.mp3 && (
                      <audio controls className="w-32">
                        <source src={item.mp3} type="audio/mpeg" />
                        Tarayıcınız ses çalmayı desteklemiyor.
                      </audio>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-sm text-gray-600 mt-2">
            Toplam {filtered.length} sonuç bulundu
            <div className="flex flex-wrap gap-2 mt-4">
  <button
    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
    className="px-3 py-1 border rounded bg-white text-purple-800 border-purple-300"
    disabled={currentPage === 1}
  >
    ← Geri
  </button>
  {(() => {
    const range = [];
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages <= 7 || i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
        range.push(i);
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        range.push("...");
      }
    }
    const cleaned = range.filter((item, index) => item !== "..." || range[index - 1] !== "...");
    return cleaned.map((num, idx) => (
      <button
        key={idx}
        onClick={() => typeof num === 'number' && setCurrentPage(num)}
        disabled={num === '...'}
        className={`px-3 py-1 border rounded ${num === currentPage ? 'bg-purple-600 text-white' : 'bg-white text-purple-800 border-purple-300'} ${num === '...' ? 'cursor-default' : ''}`}
      >
        {num}
      </button>
    ));
  })()}
  <button
    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
    className="px-3 py-1 border rounded bg-white text-purple-800 border-purple-300"
    disabled={currentPage === totalPages}
  >
    İleri →
  </button>
  <span className="ml-4 text-sm text-gray-600">Sayfa {currentPage} / {totalPages}</span>
</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries({ ...basicFilters, ...filters })
                .filter(([, val]) => val)
                .map(([key, val]) => (
                  <span key={key} className="bg-purple-100 border border-purple-300 text-purple-800 text-xs px-3 py-1 rounded-full">
                    {key.replace(/_/g, " ").replace(/^./, s => s.toUpperCase())}: {val}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

