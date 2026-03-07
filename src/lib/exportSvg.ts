export function exportSvgElement(
  svg: SVGSVGElement,
  filename = "two-four-plotter.svg",
  exportWidth = 2400,
): void {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  const viewBox = svg.viewBox.baseVal;
  const width =
    Number.isFinite(exportWidth) && exportWidth > 0 ? exportWidth : 2400;
  const height =
    viewBox && viewBox.width > 0
      ? Math.round(width * (viewBox.height / viewBox.width))
      : width;

  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));

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
