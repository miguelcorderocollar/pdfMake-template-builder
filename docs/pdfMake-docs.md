# pdfMake Library Documentation

This document outlines the core functionalities and configurations of the pdfMake library for generating PDFs in JavaScript.

## Methods

The `pdfMake.createPdf(docDefinition)` function returns a PDF document generator object with the following methods:

### `download(defaultFileName?, cb?, options?)`

Downloads the generated PDF file.

-   `defaultFileName` (optional, `string`): The file name for the download.
-   `cb` (optional, `function`): A callback function executed after download.
-   `options` (optional, `object`): Advanced options.

### `open(options?, win?)`

Opens the PDF in a new window. The PDF's name is set via the `metadata.title` property.

-   `options` (optional, `object`): Advanced options.
-   `win` (optional, `Window`): A window object for asynchronous operations.

**Asynchronous Example:**

```javascript
$scope.generatePdf = function () {
  var win = window.open("", "_blank"); // Create window first
  $http.post("/someUrl", data).then(function (response) {
    pdfMake.createPdf(docDefinition).open({}, win); // Pass 'win'
  });
};
```

**Same Window Example:**

```javascript
pdfMake.createPdf(docDefinition).open({}, window);
```

### `print(options?, win?)`

Prints the PDF.

-   `options` (optional, `object`): Advanced options.
-   `win` (optional, `Window`): A window object for asynchronous operations.

**Asynchronous Example:**

```javascript
$scope.generatePdf = function () {
  var win = window.open("", "_blank"); // Create window first
  $http.post("/someUrl", data).then(function (response) {
    pdfMake.createPdf(docDefinition).print({}, win); // Pass 'win'
  });
};
```

**Same Window Example:**

```javascript
pdfMake.createPdf(docDefinition).print({}, window);
```

### `getDataUrl(cb, options?)`

Retrieves the PDF as a URL data string (data URI).

-   `cb` (`function`): Callback function receiving the `dataUrl`.
-   `options` (optional, `object`): Advanced options.

**Example:**

```javascript
const pdfDocGenerator = pdfMake.createPdf(docDefinition);
pdfDocGenerator.getDataUrl((dataUrl) => {
  const targetElement = document.querySelector("#iframeContainer");
  const iframe = document.createElement("iframe");
  iframe.src = dataUrl;
  targetElement.appendChild(iframe);
});
```

### `getBase64(cb, options?)`

Retrieves the PDF as a base64 encoded string.

-   `cb` (`function`): Callback function receiving the base64 `data`.
-   `options` (optional, `object`): Advanced options.

**Example:**

```javascript
const pdfDocGenerator = pdfMake.createPdf(docDefinition);
pdfDocGenerator.getBase64((data) => {
  alert(data);
});
```

### `getBuffer(cb, options?)`

Retrieves the PDF as a buffer.

-   `cb` (`function`): Callback function receiving the `buffer`.
-   `options` (optional, `object`): Advanced options.

**Example:**

```javascript
const pdfDocGenerator = pdfMake.createPdf(docDefinition);
pdfDocGenerator.getBuffer((buffer) => {
  // ... process buffer
});
```

### `getBlob(cb, options?)`

Retrieves the PDF as a Blob object.

-   `cb` (`function`): Callback function receiving the `blob`.
-   `options` (optional, `object`): Advanced options.

**Example:**

```javascript
const pdfDocGenerator = pdfMake.createPdf(docDefinition);
pdfDocGenerator.getBlob((blob) => {
  // ... process blob
});
```

### `getStream(cb?)`

Retrieves the PDFKit document object as a stream.

-   `cb` (optional, `function`): Callback function receiving the `document` stream.

**Asynchronous Call (Minimal version: 0.1.66):**

```javascript
const pdfDocGenerator = pdfMake.createPdf(docDefinition);
pdfDocGenerator.getStream((document) => {
  // ... process stream
});
```

**Synchronous Call (Minimal version: 0.1.41):**

This is not the preferred method and cannot download real font files from URLs.

```javascript
const pdfDocGenerator = pdfMake.createPdf(docDefinition);
var document = pdfDocGenerator.getStream();
```

## Fonts

### Custom Fonts via URL Protocol

(Minimal version: 0.1.66) This feature is client-side only.

1.  **Assign `pdfMake.fonts`:** Before `pdfMake.createPdf()`, define your fonts with URL paths.

    ```javascript
    pdfMake.fonts = {
      yourFontName: {
        normal: "https://example.com/fonts/fontFile.ttf",
        bold: "https://example.com/fonts/fontFile2.ttf",
        italics: "https://example.com/fonts/fontFile3.ttf",
        bolditalics: "https://example.com/fonts/fontFile4.ttf",
      },
      Roboto: {
        normal:
          "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
        bold:
          "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
        italics:
          "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
        bolditalics:
          "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
      },
      PingFangSC: {
        normal: ["https://example.com/fonts/pingfang.ttc", "PingFangSC-Regular"],
        bold: ["https://example.com/fonts/pingfang.ttc", "PingFangSC-Semibold"],
      },
    };
    ```

    Alternatively, pass the `fonts` object directly to `createPdf`:

    ```javascript
    pdfMake.createPdf(docDefinition, null, fonts);
    ```

2.  **Specify Font in `docDefinition`:** Use the `font` property in `defaultStyle` or specific elements.

    ```javascript
    var docDefinition = {
      content: (...),
      defaultStyle: {
        font: 'yourFontName'
      }
    }
    ```

### Icons

1.  Create a font (e.g., using Fontello).
2.  Define the font in `pdfMake.fonts`, referencing your font file (e.g., `fontello.ttf`).
3.  Add a style for icons (e.g., `icon: { font: 'Fontello' }`).
4.  Use the icon character (from `fontello-codes.css` comments) in a text element with the icon style.

**Example:**

```javascript
pdfMake.fonts = {
  Fontello: {
    normal: "fontello.ttf",
    bold: "fontello.ttf",
    italics: "fontello.ttf",
    bolditalics: "fontello.ttf",
  },
};

var docDefinition = {
  content: [
    { text: "", style: "icon" }, // icon wifi
    {
      text: [{ text: "", style: "icon" }, " my present"], // icon gift + text
    },
  ],
  styles: {
    icon: { font: "Fontello" },
  },
};
```

### Standard 14 Fonts

These fonts only support ANSI characters (English).

**Server-side Usage:**

```javascript
var fonts = {
  Courier: { normal: "Courier", bold: "Courier-Bold", italics: "Courier-Oblique", bolditalics: "Courier-BoldOblique" },
  Helvetica: { normal: "Helvetica", bold: "Helvetica-Bold", italics: "Helvetica-Oblique", bolditalics: "Helvetica-BoldOblique" },
  Times: { normal: "Times-Roman", bold: "Times-Bold", italics: "Times-Italic", bolditalics: "Times-BoldItalic" },
  Symbol: { normal: "Symbol" },
  ZapfDingbats: { normal: "ZapfDingbats" },
};

var PdfPrinter = require("pdfmake");
var printer = new PdfPrinter(fonts);
var fs = require("fs");

var docDefinition = {
  content: [
    "First paragraph",
    "Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines",
  ],
  defaultStyle: {
    font: "Helvetica",
  },
};

var pdfDoc = printer.createPdfKitDocument(docDefinition);
pdfDoc.pipe(fs.createWriteStream("document.pdf"));
pdfDoc.end();
```

**Client-side Usage (Not supported by default due to file size, requires custom build):**

To enable, build pdfMake with standard fonts:

-   **Version 0.2.x:** `npm run build:browser-standard-fonts`
-   **Version 0.1.x:** `gulp buildWithStandardFonts`

Then, you can define and use them like server-side example in your client-side code.

```javascript
pdfMake.fonts = {
  Courier: { normal: "Courier", bold: "Courier-Bold", italics: "Courier-Oblique", bolditalics: "Courier-BoldOblique" },
  Helvetica: { normal: "Helvetica", bold: "Helvetica-Bold", italics: "Helvetica-Oblique", bolditalics: "Helvetica-BoldOblique" },
  Times: { normal: "Times-Roman", bold: "Times-Bold", italics: "Times-Italic", bolditalics: "Times-BoldItalic" },
  Symbol: { normal: "Symbol" },
  ZapfDingbats: { normal: "ZapfDingbats" },
};

var docDefinition = {
  content: [
    "First paragraph",
    "Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines",
  ],
  defaultStyle: {
    font: "Helvetica",
  },
};

pdfMake.createPdf(docDefinition).download("document.pdf");
```
````markdown
## Document Definition Object

The `docDefinition` object is the core of pdfMake, defining the structure and content of your PDF. It is declarative, meaning you describe what you want, not how to draw it.

**Basic Example:**

```javascript
var docDefinition = { content: "This is an sample PDF printed with pdfMake" };
```

**Units:** All numerical values (e.g., `fontSize`, `width`, `margin`) are in PDF/PostScript points (pt).

### Styling

You can apply styles to text elements directly or through reusable style dictionaries.

**Inline Styling:**

```javascript
var docDefinition = {
  content: [
    "This is a standard paragraph, using default style",
    { text: "This paragraph will have a bigger font", fontSize: 15 },
    {
      text: [
        "This paragraph is defined as an array of elements to make it possible to ",
        { text: "restyle part of it and make it bigger ", fontSize: 15 },
        "than the rest.",
      ],
    },
  ],
};
```

**Style Dictionaries:**

Define styles once and reuse them. Styles can be combined using an array.

```javascript
var docDefinition = {
  content: [
    { text: "This is a header", style: "header" },
    "No styling here, this is a standard paragraph",
    { text: "Another text", style: "anotherStyle" },
    { text: "Multiple styles applied", style: ["header", "anotherStyle"] },
  ],

  styles: {
    header: {
      fontSize: 22,
      bold: true,
    },
    anotherStyle: {
      italics: true,
      alignment: "right",
    },
  },
};
```

**Default Style:**

Set a `defaultStyle` to apply properties to all elements unless overridden.

```javascript
var docDefinition = {
  content: ["Text styled by default style"],

  defaultStyle: {
    fontSize: 15,
    bold: true,
  },
};
```

**Style Properties:**

-   `font`: `string` - Font name.
-   `fontSize`: `number` - Font size in pt.
-   `fontFeatures`: `string[]` - Array of advanced typographic features (TTF dependent).
-   `lineHeight`: `number` - Line height (default: 1).
-   `bold`: `boolean` - Bold text (default: `false`).
-   `italics`: `boolean` - Italic text (default: `false`).
-   `alignment`: `string` - (`'left'`, `'center'`, `'right'`, `'justify'`) Text alignment.
-   `characterSpacing`: `number` - Letter spacing in pt.
-   `color`: `string` - Text color (e.g., `'blue'`, `'#ff5500'`).
-   `background`: `string` - Text background color.
-   `markerColor`: `string` - Bullet color in bulleted lists.
-   `decoration`: `string | string[]` - Text decoration (`'underline'`, `'lineThrough'`, `'overline'`).
-   `decorationStyle`: `string` - Decoration style (`'dashed'`, `'dotted'`, `'double'`, `'wavy'`).
-   `decorationColor`: `string` - Decoration color.

### Columns

Divide available space into columns with flexible widths.

```javascript
var docDefinition = {
  content: [
    "This paragraph fills full width, as there are no columns. Next paragraph however consists of three columns",
    {
      columns: [
        {
          width: "auto", // auto-sized based on content
          text: "First column",
        },
        {
          width: "*", // fills remaining space (equal if multiple stars)
          text: "Second column",
        },
        {
          width: 100, // fixed width
          text: "Third column",
        },
        {
          width: "20%", // percentage width
          text: "Fourth column",
        },
      ],
      columnGap: 10, // optional space between columns
    },
    "This paragraph goes below all columns and has full width",
  ],
};
```

**Properties:**

-   `columnGap`: `number` - Space between columns.

### Tables

Tables support headers, borders, and cells spanning multiple columns/rows. Invalid or empty table values throw an error.

```javascript
var docDefinition = {
  content: [
    {
      layout: "lightHorizontalLines", // optional layout
      table: {
        headerRows: 1, // rows to treat as headers (repeated on new pages)
        widths: ["*", "auto", 100, "*"], // column widths

        body: [
          ["First", "Second", "Third", "The last one"],
          ["Value 1", "Value 2", "Value 3", "Value 4"],
          [{ text: "Bold value", bold: true }, "Val 2", "Val 3", "Val 4"],
        ],
      },
    },
  ],
};
```

**Table-cell Properties:**

-   `fillColor`: `string` - Background color of a cell.
-   `fillOpacity`: `string` - Background opacity of a cell.

**Table Layouts:**

-   **Available:** `'noBorders'`, `'headerLineOnly'`, `'lightHorizontalLines'`.
-   **Own Table Layouts:** Define custom layouts in `pdfMake.tableLayouts` before `createPdf()`.

    ```javascript
    pdfMake.tableLayouts = {
      exampleLayout: {
        hLineWidth: function (i, node) { /* ... */ },
        vLineWidth: function (i) { /* ... */ },
        hLineColor: function (i) { /* ... */ },
        paddingLeft: function (i) { /* ... */ },
        paddingRight: function (i, node) { /* ... */ },
      },
    };
    pdfMake.createPdf(docDefinition).download();
    ```

    Alternatively, pass `tableLayouts` directly to `createPdf`:

    ```javascript
    // Client-side
    pdfMake.createPdf(docDefinition, tableLayouts).download();

    // Server-side
    var PdfPrinter = require('pdfmake');
    var printer = new PdfPrinter(fonts);
    var myTableLayouts = { /* ... */ };
    var pdfDoc = printer.createPdfKitDocument(docDefinition, {tableLayouts: myTableLayouts});
    pdfDoc.pipe(fs.createWriteStream('document.pdf'));
    pdfDoc.end();
    ```

**`colSpan` and `rowSpan`:**

When using `colSpan` or `rowSpan`, ensure empty cells are used for the spanned columns/rows.

```javascript
var dd = {
  content: [
    {
      table: {
        body: [
          [{ text: "Header with Colspan = 2", style: "tableHeader", colSpan: 2, alignment: "center" }, "", { text: "Header 3", style: "tableHeader", alignment: "center" }],
          ["Sample value 1", { rowSpan: 3, text: "rowSpan set to 3..." }, "Sample value 3"],
          ["", "Sample value 2", "Sample value 3"],
          ["Sample value 1", "Sample value 2", "Sample value 3"],
          ["Sample value 1", { colSpan: 2, rowSpan: 2, text: "Both:\nrowSpan and colSpan..." }, ""],
          ["Sample value 1", "", ""],
        ],
      },
    },
  ],
};
```

### Lists

Supports bulleted (`ul`) and numbered (`ol`) lists.

```javascript
var docDefinition = {
  content: [
    "Bulleted list example:",
    {
      ul: [
        "Item 1",
        "Item 2",
        "Item 3",
        { text: "Item 4", bold: true },
      ],
    },
    "Numbered list example:",
    {
      ol: ["Item 1", "Item 2", "Item 3"],
    },
  ],
};
```

### Headers and Footers

Headers and footers can be static text or dynamically generated content (including page numbers, page count, and page size).

```javascript
var docDefinition = {
  header: "simple text",
  footer: {
    columns: ["Left part", { text: "Right part", alignment: "right" }],
  },
  content: (...),
};

// Dynamic example:
var docDefinition = {
  footer: function (currentPage, pageCount) {
    return currentPage.toString() + " of " + pageCount;
  },
  header: function (currentPage, pageCount, pageSize) {
    return [
      { text: "simple text", alignment: currentPage % 2 ? "left" : "right" },
      { canvas: [{ type: "rect", x: 170, y: 32, w: pageSize.width - 170, h: 40 }] },
    ];
  },
  (...),
};
```

### Background-layer

A background layer can be added to every page, either static or dynamically generated.

```javascript
var docDefinition = {
  background: "simple text",
  content: (...),
};

// Dynamic example:
var docDefinition = {
  background: function (currentPage, pageSize) {
    return `page ${currentPage} with size ${pageSize.width} x ${pageSize.height}`;
  },
  content: (...),
};
```

### Margins

Margins can be applied to any element using shorthand or specific properties.

```javascript
// margin: [left, top, right, bottom]
{ text: 'sample', margin: [ 5, 2, 10, 20 ] },

// margin: [horizontal, vertical]
{ text: 'another text', margin: [5, 2] },

// margin: equalLeftTopRightBottom
{ text: 'last one', margin: 5 }

// single-side margins
{ text: 'sample', marginLeft: 5, marginTop: 2, marginRight: 10 }
```

### Stack of Paragraphs

An array in `content` or `columns` is a shortcut for `{ stack: [] }`. To apply styling to a stack, use the explicit `stack` property.

```javascript
var docDefinition = {
  content: [
    "paragraph 1",
    "paragraph 2",
    {
      columns: [
        "first column is a simple text",
        {
          stack: [
            "paragraph A",
            "paragraph B",
            "these paragraphs will be rendered one below another inside the column",
          ],
          fontSize: 15, // Styling applied to the entire stack
        },
      ],
    },
  ],
};
```
````markdown
### Images

Supports JPEG and PNG. Images can be defined as data URIs, file names (NodeJS/VFS), or referenced from an `images` dictionary. Invalid/empty image values throw an error.

```javascript
var docDefinition = {
  content: [
    {
      // Original size
      image: "data:image/jpeg;base64,...encodedContent...",
    },
    {
      // Proportional width
      image: "data:image/jpeg;base64,...encodedContent...",
      width: 150,
    },
    {
      // Stretched
      image: "data:image/jpeg;base64,...encodedContent...",
      width: 150,
      height: 150,
    },
    {
      // Fit within rectangle
      image: "data:image/jpeg;base64,...encodedContent...",
      fit: [100, 100],
    },
    {
      // Cover rectangle
      image: "data:image/jpeg;base64,...encodedContent...",
      cover: { width: 100, height: 100, valign: "bottom", align: "right" },
    },
    {
      // Reference from images dictionary
      image: "mySuperImage",
    },
    {
      // File name (NodeJS / VFS)
      image: "myImageDictionary/image1.jpg",
    },
    {
      // URL (browser, minimal version: 0.1.67)
      image: "snow",
    },
    {
      // URL with custom headers (browser, minimal version: 0.2.5)
      image: "strawberries",
    },
  ],

  images: {
    mySuperImage: "data:image/jpeg;base64,...content...",
    snow: "https://picsum.photos/seed/picsum/200/300",
    strawberries: {
      url: "https://picsum.photos/id/1080/367/267",
      headers: {
        myheader: "123",
        myotherheader: "abc",
      },
    },
  },
};
```

### SVGs

(Minimal version: 0.1.59) Similar to images, but cannot be referenced by file or dictionary. Uses SVG-to-PDFKit for transformation. Invalid/empty SVG values throw an error.

```javascript
var docDefinition = {
  content: [
    {
      // Uses dimensions from SVG element if no width/height/fit
      svg: '<svg width="300" height="200" viewBox="0 0 300 200">...</svg>',
    },
    {
      // Proportional width
      svg: '<svg width="300" height="200" viewBox="0 0 300 200">...</svg>',
      width: 150,
    },
    {
      // Stretched
      svg: '<svg width="300" height="200" viewBox="0 0 300 200">...</svg>',
      width: 600,
      height: 400,
    },
    {
      // Fit within rectangle
      svg: '<svg width="300" height="200" viewBox="0 0 300 200">...</svg>',
      fit: [150, 100],
    },
  ],
};
```

### Links

Create external, internal page, or document destination links. Also supports local file links.

```javascript
{ text: 'google', link: 'http://google.com' }
{ text: 'Go to page 2', linkToPage: 2 }
{ text: 'Go to Header', linkToDestination: 'header' },
{ text: 'Header content', id: 'header' }, // Destination ID

var dd = {
	content: [
		{
		    text: 'link',
		    link: 'file:///c:/testFile.txt' // Local file link
		}
	]
};
```

**Properties:**

-   `link`: `string` - URL to an external site.
-   `linkToPage`: `number` - Page number to link to.
-   `linkToDestination`: `string` - ID of a destination within the document.

### QR Code

Generate QR codes with various customization options.

```javascript
var docDefinition = {
  content: [
    { qr: "text in QR" }, // Basic usage
    { qr: "text in QR", foreground: "red", background: "yellow" }, // Colored QR
    { qr: "text in QR", fit: "500" }, // Resized QR
  ],
};
```

**Properties:**

-   `qr`: `string` - Text for the QR code.
-   `foreground`: `string` (optional, default `black`) - Foreground color.
-   `background`: `string` (optional, default `white`) - Background color.
-   `fit`: `integer` (optional) - Fit the output QR image to this size.
-   `version`: `integer` (optional) - QR version (1-40).
-   `eccLevel`: `string` (optional, default `L`) - Error correction capability (`L`, `M`, `Q`, `H`).
-   `mode`: `string` (optional) - Encoding mode (`numeric`, `alphanumeric`, `octet`).
-   `mask`: `integer` (optional) - Mask pattern (0-7).

### Table of Contents

Automatically generates a table of contents from elements marked with `tocItem`.

```javascript
var docDefinition = {
  content: [
    {
      toc: {
        title: { text: "INDEX", style: "header" },
      },
    },
    {
      text: "This is a header",
      style: "header",
      tocItem: true, // Mark this as a TOC item
    },
  ],
};

// Targeting specific TOCs by ID:
var docDefinition = {
  content: [
    {
      toc: {
        id: "mainToc", // TOC ID
        title: { text: "INDEX", style: "header" },
      },
      toc: {
        id: "subToc", // Another TOC ID
        title: { text: "SUB INDEX", style: "header" },
      },
    },
    {
      text: "This is a header",
      style: "header",
      tocItem: ["mainToc", "subToc"], // Item for multiple TOCs
    },
  ],
};
```

### Watermark

Add a text watermark to every page.

```javascript
var docDefinition = {
  watermark: "test watermark", // Simple usage
  content: [
    "...",
  ],
};

// With custom style:
var docDefinition = {
  watermark: { text: "test watermark", color: "blue", opacity: 0.3, bold: true, italics: false },
  content: [
    "...",
  ],
};

// With own font size (minimal version: 0.1.60):
var docDefinition = {
  watermark: { text: "test watermark", fontSize: 20 },
  content: [
    "...",
  ],
};

// With rotation angle (minimal version: 0.1.60):
var docDefinition = {
  watermark: { text: "test watermark", angle: 70 },
  content: [
    "...",
  ],
};
```

**Properties:**

-   `text`: `string` - Watermark text.
-   `color`: `string` - Text color.
-   `opacity`: `number` - Text opacity.
-   `bold`: `boolean` - Bold style.
-   `italics`: `boolean` - Italic style.
-   `fontSize`: `number` (optional) - Custom font size (automatically calculated if not set).
-   `angle`: `number` (optional) - Rotation angle in degrees.

### Page Dimensions, Orientation and Margins

Control page size, orientation, and margins. Orientation can be changed within the document.

```javascript
var docDefinition = {
  pageSize: "A5", // string or { width: number, height: number }
  pageOrientation: "landscape", // 'portrait' or 'landscape'
  pageMargins: [40, 60, 40, 60], // [left, top, right, bottom] or [horizontal, vertical] or number
};

// Available pageSize strings:
// '4A0', '2A0', 'A0'...'A10', 'B0'...'B10', 'C0'...'C10',
// 'RA0'...'RA4', 'SRA0'...'SRA4',
// 'EXECUTIVE', 'FOLIO', 'LEGAL', 'LETTER', 'TABLOID'

// Change page orientation within document:
{
  pageOrientation: 'portrait',
  content: [
    {text: 'Text on Portrait'},
    {text: 'Text on Landscape', pageOrientation: 'landscape', pageBreak: 'before'},
    {text: 'Text on Landscape 2', pageOrientation: 'portrait', pageBreak: 'after'},
    {text: 'Text on Portrait 2'},
  ]
}

// Automatic page height:
var dd = {
  pageSize: {
    width: 595.28,
    height: 'auto'
  },
  content: [
    // ...
  ]
}
```

**Dynamically Control Page Breaks (e.g., prevent orphans):**

A `pageBreakBefore` function can be defined to insert page breaks based on node properties.

```javascript
var dd = {
  content: [
    {text: '1 Headline', headlineLevel: 1},
    'Some long text of variable length ...',
    {text: '2 Headline', headlineLevel: 1},
    'Some long text of variable length ...',
    {text: '3 Headline', headlineLevel: 1},
    'Some long text of variable length ...',
  ],
  pageBreakBefore: function(currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
     return currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0;
  }
}
```

`currentNode` object provides detailed information about the current element.
````markdown
### Document Metadata

Add various metadata to your PDF document.

```javascript
var docDefinition = {
  info: {
    title: "awesome Document",
    author: "john doe",
    subject: "subject of document",
    keywords: "keywords for document",
  },
  content: "This is an sample PDF printed with pdfMake",
};
```

**Standard Properties:**

-   `title`: Document title.
-   `author`: Author's name.
-   `subject`: Document subject.
-   `keywords`: Keywords.
-   `creator`: Document creator (default: `'pdfmake'`).
-   `producer`: Document producer (default: `'pdfmake'`).
-   `creationDate`: Date of creation (added automatically).
-   `modDate`: Last modified date.
-   `trapped`: Indicates if document is "trapped" for color misregistrations.

**Custom Properties:** You can add custom properties; keys cannot contain spaces.

**Document Language:** Set the document language using the `language` property.

```javascript
var docDefinition = {
  language: "cs-CZ",
  content: "Jednoduchý PDF dokument vytvoření pomocí pdfmake",
};
```

### Patterns

(Minimal version: 0.2.3) Define tiling patterns as a dictionary within `docDefinition`.

**Pattern Definition:**

-   `boundingBox`: `[x, y, width, height]` - Bounding box for clipping the pattern cell.
-   `xStep`: `number` - Horizontal spacing between cells.
-   `yStep`: `number` - Vertical spacing between cells.
-   `pattern`: `string` - PDF stream of operations (graphics/text) for the cell.

**Example Pattern:**

```javascript
var docDefinition = {
  content: ["..."],
  patterns: {
    stripe45d: {
      boundingBox: [1, 1, 4, 4],
      xStep: 3,
      yStep: 3,
      pattern: "1 w 0 1 m 4 5 l s 2 0 m 5 3 l s",
    },
  },
};
```

**Usage:**

Patterns are used as a tuple `[patternKey, colorString]`.

-   **Text:** `background: ['patternKey', 'color']`
-   **Vectors:** `color: ['patternKey', 'color']` (as fill)
-   **Table Cells:**
    -   `fillColor: ['patternKey', 'color']`
    -   `overlayPattern: ['patternKey', 'color']`
    -   `overlayOpacity: number`

**Examples:**

```javascript
// Text
{ text: 'Insert lorem. And ipsum', background: ['stripe45d', 'gray'] }

// Vector
{
  type: 'rect',
  x: 10, y: 250, w: 50, h: 30,
  color: ['stripe45d', 'blue'],
}

// Table cell
{
  text: 'Sample value',
  fillOpacity: 0.85,
  fillColor: ['stripe45d', 'blue']
}
{
  text: 'Sample value',
  fillOpacity: 0.15,
  fillColor: 'blue',
  overlayPattern: ['stripe45d', 'gray'],
  overlayOpacity: 0.15
}
```

### Compression

PDF compression is enabled by default. Set `compress: false` to disable it.

```javascript
var docDefinition = {
  compress: false,
  content: (...),
};
```

### Encryption and Access Privileges

(Minimal version: 0.1.50) Encrypt PDF files and control user permissions.

```javascript
var docDefinition = {
  userPassword: "123", // Password to open the document
  ownerPassword: "123456", // Password for full access/permission setting
  permissions: {
    printing: "highResolution", // 'lowResolution' or 'highResolution'
    modifying: false,
    copying: false,
    annotating: true,
    fillingForms: true,
    contentAccessibility: true,
    documentAssembly: true,
  },
  content: [
    "...",
  ],
};
```

**Settings in `permissions` object:**

-   `printing`: Whether printing is allowed (`'lowResolution'`, `'highResolution'`).
-   `modifying`: Allow modifying document content.
-   `copying`: Allow copying text/graphics.
-   `annotating`: Allow annotating, form filling.
-   `fillingForms`: Allow form filling and signing.
-   `contentAccessibility`: Allow copying text for accessibility.
-   `documentAssembly`: Allow document assembly.

**Password Behavior:**

-   **User Password Only:** Users with user password have full access.
-   **Owner Password Only:** Users open without password but have limited access based on `permissions`. Owner password grants full access.
-   **Both Passwords:** User password grants limited access based on `permissions`. Owner password grants full access.

**Note:** PDF access privileges rely on the PDF viewer to enforce them after decryption.

**Encryption Method (controlled by `version` property):**

The best possible encryption method for the specified PDF version is used.

-   `1.3`: (Default) 40-bit RC4.
-   `1.4`: 128-bit RC4.
-   `1.5`: 128-bit RC4.
-   `1.6`: 128-bit AES.
-   `1.7`: 128-bit AES.
-   `1.7ext3`: 256-bit AES.

**Password Length:**

-   `1.7ext3`: Password truncated to 127 bytes (UTF-8).
-   Older versions: Password truncated to 32 bytes (Latin-1 characters only).

### PDF/A

(Minimal version: 0.2.15) Specialized for archiving and long-term preservation. Requires PDF version 1.4 or above.

```javascript
var docDefinition = {
  version: "1.5", // PDF version (1.4 or above required)
  subset: "PDF/A-3a", // PDF/A subset
  tagged: true, // Mark document as Tagged PDF
  displayTitle: true, // Display document title in window title
  info: {
    title: "Awesome PDF document from pdfmake",
  },
  content: ["PDF/A document for archive"],
};
```

**Supported PDF Versions (`version` property):**

-   `1.4`, `1.5`, `1.6`, `1.7`, `1.7ext3` (1.3 does not support PDF/A).

**Subset of Document (`subset` property):**

-   `PDF/A-1` (shortcut for `PDF/A-1b`), `PDF/A-1a`, `PDF/A-1b`
-   `PDF/A-2` (shortcut for `PDF/A-2b`), `PDF/A-2a`, `PDF/A-2b`
-   `PDF/A-3` (shortcut for `PDF/A-3b`), `PDF/A-3a`, `PDF/A-3b`

**`tagged` property:**
-   `true`: Enable Tagged PDF.
-   `false`: Disable Tagged PDF.

**`displayTitle` property:**
-   `true`: Enable display of document title in window title.
-   `false`: Disable display of document title in window title.
```