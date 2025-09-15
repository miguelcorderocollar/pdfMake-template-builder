import { DocDefinition } from "@/types";

// Default example based on docs/examples/styles-simple.js
export const stylesSimpleDoc: DocDefinition = {
  pageSize: 'A4',
  pageOrientation: 'portrait',
  pageMargins: [40, 60, 40, 60],
  info: { title: 'Styles Simple Example' },
  language: 'en-US',
  watermark: { text: '' },
  content: [
    {
      text: 'This is a header, using header style',
      style: 'header'
    },
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam.\n\n',
    {
      text: 'Subheader 1 - using subheader style',
      style: 'subheader'
    },
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.',
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.',
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.\n\n',
    {
      text: 'Subheader 2 - using subheader style',
      style: 'subheader'
    },
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.',
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.\n\n',
    {
      text: 'It is possible to apply multiple styles, by passing an array. This paragraph uses two styles: quote and small. When multiple styles are provided, they are evaluated in the specified order which is important in case they define the same properties',
      style: ['quote', 'small']
    },
    { text: 'Image example (base64)', style: 'subheader' },
    // 1x1 black pixel PNG (full data URL example)
    { image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAEBUlEQVR4AYyTbUxbVRjH/+fc3tsX2gJtealjjIGbG4sxmEUTRtQtfjAyScw04IbGKDPxJRrQGFkWFVEW44e5bENizByIH4aTDyxbRGM0i04mgtNkncFNmEJKoeOl7W1vC/cen1tcw1jm9qT/+5znnP/5nZ57zuW4SQgBJnogpQUw3CRuCIx9tvYutff2Q4lT639IuDcMxl0bBhMn1p9WvyhrTXxaUnIj7nXA2c41FbEvy07yfGWIe5UXWY5cyV1SBXdLFSxXrmJ51r2i0BpQj5d+Eu4sWrUSfA0w0r3mUdmtDEs+68PcbZG4g4PbGNLZQdlOoj6WbbFzn/VZm8sWiB4t3oRlkQGqR/x3S065W/LKYARhVraUCQISs3MwyukFaBw2Dskju7lT7pt+H66rTH61AYfjMHPLDqZwMIVgVso0kds4OME59XGzj9rmuFkzs3bLpUrhqnaBpQPjoBBdBVlwShVpgwwwmaHz2Cze+2AKukE1owU4Q1wT2NsaQt83UZietOwSpCzlweDbsIOCkxA1rLuYjf6HBDALTSZ99XUMp39UoWlExFJ8+10Mly6mcLI/AtCikEwvwBxSgeJ3FYOCk8Al6T5I1OQMoAQC37FRQVmpAoW2anpMVVXaISSBe+9xgJGPkQ+MAbLEmBavMj3cfIDBR0Ja5oPArW/50XFwNQGXLKDweGT0fF6C3c/4YNpgBvFMpuDCY5Zpt2GIIOiTAL1ZdWQG8d9jSIWSMBYAsWiQ9P8koCeB5IQG9ZyKZFAlA/0Mei0GC2WATNf7xSLRdKD/J4au89sRVA4A2UchXB/ByDpIuZ3UAebpQjj3Y/RcrsXIJQPCEBDagpFa0L/PAJ1j//RCM1ShC6y704K+niNoqN+B+ro6vNHchta2Drzz7mE072nDk0/U4unHq9HbfQieIgXQgcX52HgyilAGyFqQMqILZwSd6MZ1DlRvc0G2AOHQBP7+bQjhXwcxOXwWF4cHMBUch43uYkNdDvx5MvT5uFgIh4+vbYGWAZoNLMbr9dn4NKOtP1ebi7bXC7Bzczn2P7ADrZXbsW9LDQ5sfQwPbS7E/jf9qL7fBUPTkRqfHPDNoTnNoEf6UCjD9VRoypibrVkMzo8jYaC8xIpdz6vwVg/CsW0orfyaQbz8ghXFeRYYc3GhjVw+m5xN7DR3aDJMZYBmkb07MpAKTGxK/TVxTJ9Rp/Voku4dfRXOGbq8VyBEBNQvkqOTE4nAaLuqJrb6mzGGZXEN0Oz3tiCS0xCpcz4ylq8F/tyiDl/4MP5z4JT6y4UTsXMj++bPj5bn1F8p8r2Kl1Y3IWHOWa7rgMsHva/gTF4jGr1NqPY1oSa/EXtuew1/LPesbP8vcKX5Vup/AQAA//+wQD2mAAAABklEQVQDAHp0eDgu/KB6AAAAAElFTkSuQmCC', width: 100, height: 100 },
    { text: 'List example', style: 'subheader' },
    { ul: ['First item', 'Second item', 'Third item'] },
    { text: 'Table example', style: 'subheader' },
    { table: { headerRows: 1, widths: ['*', 'auto', '*'], body: [ ['Name', 'Age', 'City'], ['Alice', '30', 'London'], ['Bob', '28', 'Paris'] ] }, layout: 'lightHorizontalLines' }
  ],
  styles: {
    header: {
      fontSize: 18,
      bold: true
    },
    subheader: {
      fontSize: 15,
      bold: true
    },
    quote: {
      italics: true
    },
    small: {
      fontSize: 8
    }
  }
};


