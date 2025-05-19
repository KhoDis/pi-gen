export type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export class Layer {
  pixels: Map<string, RGBA> = new Map();
  private readonly SEPARATOR = ":";

  constructor(
    public width: number,
    public height: number,
  ) {}

  setPixel(x: number, y: number, color: RGBA) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.pixels.set(`${x}${this.SEPARATOR}${y}`, color);
    }
  }

  toImageData(): ImageData {
    const data = new Uint8ClampedArray(this.width * this.height * 4).fill(0);

    this.pixels.forEach((color, key) => {
      const [x, y] = key.split(this.SEPARATOR).map(Number);
      const index = (y * this.width + x) * 4;
      data[index] = color.r;
      data[index + 1] = color.g;
      data[index + 2] = color.b;
      data[index + 3] = color.a;
    });

    return new ImageData(data, this.width, this.height);
  }
}
