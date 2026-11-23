// Writes a baseline (non-progressive) JPEG without metadata: swift jpeg.swift <in> <out> <quality 0-1>
import Foundation
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count == 4, let quality = Double(args[3]),
  let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: args[1]) as CFURL, nil),
  let image = CGImageSourceCreateImageAtIndex(source, 0, nil),
  let dest = CGImageDestinationCreateWithURL(
    URL(fileURLWithPath: args[2]) as CFURL, UTType.jpeg.identifier as CFString, 1, nil)
else {
  FileHandle.standardError.write("usage: jpeg <in> <out> <quality 0-1>\n".data(using: .utf8)!)
  exit(1)
}
// Redraw into plain pixels: an image still tied to a JPEG source keeps that file's encoding mode.
let width = image.width, height = image.height
guard
  let ctx = CGContext(
    data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0,
    space: CGColorSpace(name: CGColorSpace.sRGB)!,
    bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)
else { exit(1) }
ctx.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
let pixels = ctx.makeImage()!
let options: [CFString: Any] = [
  kCGImageDestinationLossyCompressionQuality: quality,
  kCGImagePropertyJFIFDictionary: [kCGImagePropertyJFIFIsProgressive: false],
]
CGImageDestinationAddImage(dest, pixels, options as CFDictionary)
exit(CGImageDestinationFinalize(dest) ? 0 : 1)
