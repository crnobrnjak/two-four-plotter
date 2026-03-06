export function exportSvgElement(
  svg: SVGSVGElement,
  filename = "two-four-plotter.svg",
): void {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(clone);

  if (!source.startsWith("<?xml")) {
    source = `<?xml version="1.0" standalone="no"?>\n${source}`;
  }

  const blob = new Blob([source], {
    type: "image/svg+xml;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
