/**
 * Layer class for the Pi-Gen project
 *
 * This class represents a layer of pixel data with methods for manipulation and rendering.
 */

/**
 * RGBA color type
 */
export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Layer class for pixel manipulation
 */
export class Layer {
  readonly width: number;
  readonly height: number;
  private readonly pixels: Map<string, RGBA>;
  private readonly SEPARATOR = ":";

  /**
   * Create a new Layer
   * @param width Width of the layer in pixels
   * @param height Height of the layer in pixels
   */
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.pixels = new Map();
  }

  /**
   * Set a pixel at the specified coordinates
   * @param x X coordinate
   * @param y Y coordinate
   * @param color RGBA color
   */
  setPixel(x: number, y: number, color: RGBA): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.pixels.set(`${x}${this.SEPARATOR}${y}`, { ...color });
    }
  }

  /**
   * Get the color of a pixel at the specified coordinates
   * @param x X coordinate
   * @param y Y coordinate
   * @returns RGBA color or null if the pixel is not set
   */
  getPixel(x: number, y: number): RGBA | null {
    const pixel = this.pixels.get(`${x}${this.SEPARATOR}${y}`);
    return pixel ? { ...pixel } : null;
  }

  /**
   * Clear the layer, optionally filling it with a color
   * @param color Optional color to fill the layer with
   */
  clear(color?: RGBA): void {
    this.pixels.clear();

    if (color) {
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          this.setPixel(x, y, color);
        }
      }
    }
  }

  /**
   * Create a copy of this layer
   * @returns A new Layer instance with the same dimensions and pixel data
   */
  clone(): Layer {
    const newLayer = new Layer(this.width, this.height);

    this.pixels.forEach((color, key) => {
      const [x, y] = key.split(this.SEPARATOR).map(Number);
      newLayer.setPixel(x, y, { ...color });
    });

    return newLayer;
  }

  /**
   * Convert the layer to ImageData for canvas rendering
   * @returns ImageData representation of the layer
   */
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

  /**
   * Create a Layer from ImageData
   * @param imageData ImageData to create the layer from
   * @returns A new Layer instance
   */
  static fromImageData(imageData: ImageData): Layer {
    const { width, height, data } = imageData;
    const layer = new Layer(width, height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;

        if (data[index + 3] > 0) {
          // Only set non-transparent pixels
          layer.setPixel(x, y, {
            r: data[index],
            g: data[index + 1],
            b: data[index + 2],
            a: data[index + 3],
          });
        }
      }
    }

    return layer;
  }
}
