let list;

const filesAPIUrl = "https://klimdanick.nl/filesAPI/api/files"

const createFileList = () => {
  list = Layout.grid({ classes: ["mainContent"], id: "files" })

  loadFiles().then(files => {
    fileList = files;
    list.append(getFileList())
    list.append(stringToHTML(`<input type="file" id="fileInput" onInput="handleUpload()"/>`))
    list.render()
  })

  return list;
}

let fileList = [] /*[
    {id: 1, title: "example.txt", size: 1234, createdAt: Date.now()},
    {id: 2, title: "example2.txt", size: 5678, createdAt: Date.now()},
    {id: 3, title: "example3.txt", size: 91011, createdAt: Date.now()},
]*/

const loadFiles = () => fetch(filesAPIUrl, {}).then(res => res.json())

const getFileList = (files = fileList) => {
  const list = []
  let i = 0;
  files.forEach(file => {
    const name = stringToHTML(`<span>${file.title}</span>`)
    const size = stringToHTML(`<span>${formatBytes(file.size)}</span>`)
    let link, delete_;
    list.push([
      name,
      size,
      new Date(file.createdAt).toLocaleDateString(),
      link = new Badge({ classes: ["primary"] }).append("Link"),
      delete_ = new Badge({ classes: ["danger"] }).append("Delete"),
    ]);
    link.listeners.click = () => {
      window.location = filesAPIUrl + "/" + file.title;
    }
    delete_.listeners.click = () => { }
  })
  return new Table({ columns: ["file name", "size", "upload date", "link", "delete"], data: list });
}

function handleUpload() {
  const input = document.getElementById("fileInput")
  const file = input.files[0]

  if (!file) {
    alert("Select a file first")
    return
  }

  uploadFile(file)
}

const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(filesAPIUrl, {
    method: "POST",
    body: formData
  })

  const data = await response.json()
  console.log(data)

  loadPage(await createFileList())
}

/**
 * Format a number of bytes into a human-readable string with the correct unit.
 *
 * @param {number} bytes - The byte count (can be negative).
 * @param {Object} [options]
 * @param {boolean} [options.si=false] - Use SI (decimal) units if true (kB, MB, ...).
 *                                       Use IEC (binary) units if false (KiB, MiB, ...).
 * @param {number}  [options.maximumFractionDigits=2] - Max decimal places.
 * @param {number}  [options.minimumFractionDigits=0] - Min decimal places.
 * @param {string | string[]} [options.locale=undefined] - Locale for Intl.NumberFormat.
 * @param {boolean} [options.space=true] - Insert a space between number and unit.
 * @returns {string}
 */
function formatBytes(bytes, options = {}) {
  const {
    si = true,
    maximumFractionDigits = 2,
    minimumFractionDigits = 0,
    locale,
    space = true,
  } = options;

  if (typeof bytes !== 'number' || !Number.isFinite(bytes)) return 'NaN';

  const negative = bytes < 0;
  let value = Math.abs(bytes);

  const base = si ? 1000 : 1024;
  const units = si
    ? ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  // Handle 0 or very small values
  if (value < 1) {
    const formattedZero = new Intl.NumberFormat(locale, {
      maximumFractionDigits,
      minimumFractionDigits,
    }).format(0);
    return `${negative ? '-' : ''}${formattedZero}${space ? ' ' : ''}${units[0]}`;
  }

  let idx = Math.floor(Math.log(value) / Math.log(base));
  idx = Math.min(idx, units.length - 1);

  const scaled = value / Math.pow(base, idx);

  const formatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits,
    minimumFractionDigits,
  });

  const num = formatter.format(scaled);
  const unit = units[idx];
  return `${negative ? '-' : ''}${num}${space ? ' ' : ''}${unit}`;
}