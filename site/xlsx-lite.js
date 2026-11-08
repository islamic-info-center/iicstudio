// IIC Studio — a small Excel (.xlsx) writer for the admin exports. No library: the sheets are written
// as XML and packed in an uncompressed zip, which Excel, Numbers and Google Sheets all open.
// Cell styles: 0 plain · 1 header · 2 title · 3 confirmed (green) · 4 cancelled (red) · 5 bold
(function(){
  const enc = new TextEncoder();
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++){ let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };

  function zip(files){   // files: [[name, string]] → Uint8Array (stored, no compression)
    const parts = [], central = []; let off = 0;
    const u16 = n => [n & 255, (n >>> 8) & 255], u32 = n => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];
    files.forEach(([name, text]) => {
      const nm = enc.encode(name), data = enc.encode(text), crc = crc32(data);
      const head = [...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nm.length), ...u16(0)];
      parts.push(new Uint8Array(head), nm, data);
      central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nm.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off)]), nm);
      off += head.length + nm.length + data.length;
    });
    const cdSize = central.reduce((s, p) => s + p.length, 0);
    const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(cdSize), ...u32(off), ...u16(0)]);
    const all = parts.concat(central, [end]), out = new Uint8Array(all.reduce((s, p) => s + p.length, 0));
    let p = 0; all.forEach(x => { out.set(x, p); p += x.length; });
    return out;
  }

  const x = s => String(s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
  const col = i => { let s = ""; i++; while (i){ const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = (i - m - 1) / 26; } return s; };

  function sheetXML(sh){
    const rows = sh.rows.map((r, ri) => {
      const cells = r.map((v, ci) => {
        if (v == null || v === "") return "";
        const cell = typeof v === "object" ? v : {v};
        const ref = col(ci) + (ri + 1), s = cell.s || (sh.header === ri ? 1 : 0);
        return typeof cell.v === "number" ? `<c r="${ref}" s="${s}"><v>${cell.v}</v></c>` : `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${x(cell.v)}</t></is></c>`;
      }).join("");
      return `<row r="${ri + 1}">${cells}</row>`;
    }).join("");
    const cols = (sh.widths || []).map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("");
    const freeze = sh.header != null ? `<pane ySplit="${sh.header + 1}" topLeftCell="A${sh.header + 2}" activePane="bottomLeft" state="frozen"/>` : "";
    const filter = sh.header != null && sh.rows.length > sh.header + 1 ? `<autoFilter ref="A${sh.header + 1}:${col(sh.rows[sh.header].length - 1)}${sh.rows.length}"/>` : "";
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"${sh.rtl ? ' rightToLeft="1"' : ""}>${freeze}</sheetView></sheetViews>${cols ? `<cols>${cols}</cols>` : ""}<sheetData>${rows}</sheetData>${filter}</worksheet>`;
  }

  const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="4"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Arial"/></font><font><b/><sz val="15"/><color rgb="FF251B57"/><name val="Arial"/></font><font><b/><sz val="11"/><name val="Arial"/></font></fonts>
<fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF251B57"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE3F4EA"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFBE3DC"/></patternFill></fill></fills>
<borders count="2"><border/><border><left style="thin"><color rgb="FFD5DBE8"/></left><right style="thin"><color rgb="FFD5DBE8"/></right><top style="thin"><color rgb="FFD5DBE8"/></top><bottom style="thin"><color rgb="FFD5DBE8"/></bottom></border></borders>
<cellStyleXfs count="1"><xf/></cellStyleXfs>
<cellXfs count="6"><xf borderId="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="center" wrapText="1"/></xf><xf fontId="2" applyFont="1"/><xf fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" horizontal="center"/></xf><xf fontId="3" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" horizontal="center"/></xf><xf fontId="3" borderId="1" applyFont="1" applyBorder="1"/></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

  /** sheets: [{name, rows: [[value | {v, s}]], widths: [chars], header: row index, rtl}] → Blob */
  function makeXlsx(sheets){
    const name = s => x(String(s).replace(/[\\\/?*\[\]:]/g, " ").slice(0, 31));
    const files = [
      ["[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((s, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`],
      ["_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
      ["xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets>${sheets.map((s, i) => `<sheet name="${name(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets>${sheets.some(s => s.header != null && s.rows.length > s.header + 1) ? `<definedNames>${sheets.map((s, i) => s.header != null && s.rows.length > s.header + 1 ? `<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${name(s.name).replace(/'/g, "''")}'!$A$${s.header + 1}:$${col(s.rows[s.header].length - 1)}$${s.rows.length}</definedName>` : "").join("")}</definedNames>` : ""}</workbook>`],
      ["xl/_rels/workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((s, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
      ["xl/styles.xml", STYLES]
    ].concat(sheets.map((s, i) => [`xl/worksheets/sheet${i + 1}.xml`, sheetXML(s)]));
    return new Blob([zip(files)], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
  }
  window.makeXlsx = makeXlsx;
})();
