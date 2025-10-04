import { DocDefinition } from "@/types";

// Default demo template based on docs/examples/styles-simple.js
export const demoTemplate: DocDefinition = {
  pageSize: 'A4',
  pageOrientation: 'portrait',
  pageMargins: [40, 60, 40, 60],
  header: {
    text: 'PDFMake Template Builder',
    style: 'header',
    alignment: 'center'
  },
  footer: {
    columns: [
      'Left part',
      { text: 'Right part', alignment: 'right' }
    ]
  },
  info: { title: 'Demo Template' },
  language: 'en-US',
  watermark: { text: '' },
  content: [
    {
      text: 'Explore the pdfMake template builder',
      style: 'header',
      margin: [0, 0, 0, 20],
      _name: 'Main Title'
    },
    {
      text: 'This default template walks through each node type so you can see how updates in the editor reflect in the PDF preview. Try selecting items in the sidebar to edit their content, style, or configuration.',
      margin: [0, 0, 0, 20],
      _name: 'Introduction'
    },
    {
      text: 'Working with text styles',
      style: 'subheader',
      margin: [0, 0, 0, 15],
      _name: 'Text Styles Section'
    },
    {
      text: 'Text nodes map to pdfMake paragraphs. Change the font size, weight, or color in the right-hand panel and watch the preview refresh instantly. You can also use custom styles defined under the Styles tab.',
      margin: [0, 0, 0, 20]
    },
    {
      text: 'Combining multiple styles lets you layer typography rules. This paragraph uses the built-in quote and small styles so you can see how arrays apply in order.',
      style: ['quote', 'small'],
      margin: [0, 0, 0, 20]
    },
    {
      text: 'Adding images',
      style: 'subheader',
      margin: [0, 0, 0, 15],
      _name: 'Images Section'
    },
    {
      text: 'Images accept base64 strings, URLs, or asset references. Adjust width, height, and alignment to experiment with layout. Swap the source from the sidebar to try your own graphic.',
      margin: [0, 0, 0, 20]
    },
    {
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAEBUlEQVR4AYyTbUxbVRjH/+fc3tsX2gJtealjjIGbG4sxmEUTRtQtfjAyScw04IbGKDPxJRrQGFkWFVEW44e5bENizByIH4aTDyxbRGM0i04mgtNkncFNmEJKoeOl7W1vC/cen1tcw1jm9qT/+5znnP/5nZ57zuW4SQgBJnogpQUw3CRuCIx9tvYutff2Q4lT639IuDcMxl0bBhMn1p9WvyhrTXxaUnIj7nXA2c41FbEvy07yfGWIe5UXWY5cyV1SBXdLFSxXrmJ51r2i0BpQj5d+Eu4sWrUSfA0w0r3mUdmtDEs+68PcbZG4g4PbGNLZQdlOoj6WbbFzn/VZm8sWiB4t3oRlkQGqR/x3S065W/LKYARhVraUCQISs3MwyukFaBw2Dskju7lT7pt+H66rTH61AYfjMHPLDqZwMIVgVso0kds4OME59XGzj9rmuFkzs3bLpUrhqnaBpQPjoBBdBVlwShVpgwwwmaHz2Cze+2AKukE1owU4Q1wT2NsaQt83UZietOwSpCzlweDbsIOCkxA1rLuYjf6HBDALTSZ99XUMp39UoWlExFJ8+10Mly6mcLI/AtCikEwvwBxSgeJ3FYOCk8Al6T5I1OQMoAQC37FRQVmpAoW2anpMVVXaISSBe+9xgJGPkQ+MAbLEmBavMj3cfIDBR0Ja5oPArW/50XFwNQGXLKDweGT0fF6C3c/4YNpgBvFMpuDCY5Zpt2GIIOiTAL1ZdWQG8d9jSIWSMBYAsWiQ9P8koCeB5IQG9ZyKZFAlA/0Mei0GC2WATNf7xSLRdKD/J4au89sRVA4A2UchXB/ByDpIuZ3UAebpQjj3Y/RcrsXIJQPCEBDagpFa0L/PAJ1j//RCM1ShC6y704K+niNoqN+B+ro6vNHchta2Drzz7mE072nDk0/U4unHq9HbfQieIgXQgcX52HgyilAGyFqQMqILZwSd6MZ1DlRvc0G2AOHQBP7+bQjhXwcxOXwWF4cHMBUch43uYkNdDvx5MvT5uFgIh4+vbYGWAZoNLMbr9dn4NKOtP1ebi7bXC7Bzczn2P7ADrZXbsW9LDQ5sfQwPbS7E/jf9qL7fBUPTkRqfHPDNoTnNoEf6UCjD9VRoypibrVkMzo8jYaC8xIpdz6vwVg/CsW0orfyaQbz8ghXFeRYYc3GhjVw+m5xN7DR3aDJMZYBmkb07MpAKTGxK/TVxTJ9Rp/Voku4dfRXOGbq8VyBEBNQvkqOTE4nAaLuqJrb6mzGGZXEN0Oz3tiCS0xCpcz4ylq8F/tyiDl/4MP5z4JT6y4UTsXMj++bPj5bn1F8p8r2Kl1Y3IWHOWa7rgMsHva/gTF4jGr1NqPY1oSa/EXtuew1/LPesbP8vcKX5Vup/AQAA//+wQD2mAAAABklEQVQDAHp0eDgu/KB6AAAAAElFTkSuQmCC',
      width: 100,
      height: 100,
      margin: [0, 0, 0, 20],
      _name: 'Sample Logo'
    },
    {
      text: 'Lists and bullet points',
      style: 'subheader',
      margin: [0, 0, 0, 15],
      _name: 'Lists Section'
    },
    {
      ul: [
        'Use unordered or ordered lists to organize related items.',
        'Double-click any list entry in the editor to rename it.',
        'Try nesting lists to create multi-level outlines.'
      ],
      margin: [0, 0, 0, 20],
      _name: 'Feature List'
    },
    {
      text: 'Table data overview',
      style: 'subheader',
      margin: [0, 0, 0, 15],
      _name: 'Tables Section'
    },
    {
      text: 'Tables bundle rows and columns with metadata. Header rows stay bold, column widths control layout, and the layout property toggles grid lines. Select the table to edit body cells, add columns, or change the styling.',
      style: 'small',
      margin: [0, 0, 0, 20]
    },
    {
      table: {
        headerRows: 1,
        widths: ['*', 'auto', '*'],
        body: [
          ['Feature', 'Type', 'Where to tweak'],
          ['Styles', 'Text', 'Styles panel'],
          ['Images', 'Media', 'Content inspector'],
          ['Tables', 'Structured data', 'Table controls']
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 20],
      _name: 'Features Table'
    },
    {
      text: 'Ready to customize further? Add new nodes from the Elements panel or import your own pdfMake definition to see how everything renders instantly.',
      margin: [0, 0, 0, 20]
    },
    {
      text: 'Custom node examples',
      style: 'subheader',
      margin: [0, 0, 0, 15]
    },
    {
      text: 'PDFMake lets you create custom structures by combining multiple elements. Below are two simple examples showing how to build reusable components:',
      margin: [0, 0, 0, 15]
    },
    {
      columns: [
        {
          width: '50%',
          stack: [
            { text: 'Example 1: Info Box', style: 'subheader', fontSize: 12, margin: [0, 0, 0, 10] },
            { text: 'Title: Quick Tip', bold: true, margin: [0, 0, 0, 5] },
            { text: 'Custom nodes use columns and stacks to arrange content. This example combines text elements with different styles to create an information box.', fontSize: 10 }
          ],
          margin: [0, 0, 10, 0]
        },
        {
          width: '50%',
          stack: [
            { text: 'Example 2: Stat Card', style: 'subheader', fontSize: 12, margin: [0, 0, 0, 10] },
            { text: '1,234', fontSize: 24, bold: true, color: '#1d4ed8', alignment: 'center', margin: [0, 0, 0, 5] },
            { text: 'Total Downloads', fontSize: 10, alignment: 'center', color: '#64748b' }
          ],
          margin: [10, 0, 0, 0]
        }
      ],
      margin: [0, 0, 0, 20]
    },
    {
      text: 'These custom structures showcase how columns, stacks, and inline styles combine to create reusable design patterns. Select them in the editor to inspect their properties.',
      style: 'small',
      margin: [0, 0, 0, 20]
    },
    {
      text: 'Rich Text & Inline Styling',
      style: 'subheader',
      margin: [0, 0, 0, 15],
      _name: 'Rich Text Section'
    },
    {
      text: 'You can now create rich text with inline styles! Try switching a text node to "Rich Text" mode to mix different styles within a single paragraph.',
      margin: [0, 0, 0, 10]
    },
    {
      text: [
        'This paragraph uses ',
        { text: 'bold text', bold: true },
        ', ',
        { text: 'italic text', italics: true },
        ', ',
        { text: 'colored text', color: '#dc2626' },
        ', and ',
        { text: 'large text', fontSize: 16 },
        ' all in one line!'
      ],
      margin: [0, 0, 0, 10],
      _name: 'Rich Text Demo'
    },
    {
      text: [
        'You can even combine ',
        { text: 'bold and italic', bold: true, italics: true },
        ' or use ',
        { text: 'style references', style: 'subheader' },
        ' alongside inline styles.'
      ],
      margin: [0, 0, 0, 20]
    },
    {
      text: 'Test Header/Footer',
      style: 'header',
      pageBreak: 'before'
    },
    {
      text: 'This content appears on a new page to test the header and footer functionality. The header shows "PDFMake Template Builder" centered at the top, and the footer shows "Left part" on the left and "Right part" on the right.',
      margin: [0, 0, 0, 20]
    }
  ],
  styles: {
    header: {
      fontSize: 18,
      bold: true,
      color: '#1d4ed8'
    },
    subheader: {
      fontSize: 15,
      bold: true,
      color: '#9333ea'
    },
    quote: {
      italics: true,
      color: '#475569'
    },
    small: {
      fontSize: 8,
      color: '#64748b'
    }
  }
};


