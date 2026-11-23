import AppKit
import CoreGraphics
import Foundation

// Draws the app icon (white superellipse screen with the dock peeking from below): npm run icon
let args = CommandLine.arguments
let out = args[1]
let size = CGFloat(Double(args[2]) ?? 1024)

// Superellipse |x/a|^n + |y/b|^n = 1 (n = 5, close to Apple's squircle), sampled as a path.
func squircle(_ rect: CGRect, n: CGFloat = 5, steps: Int = 720) -> CGPath {
  let path = CGMutablePath()
  let a = rect.width / 2, b = rect.height / 2
  let cx = rect.midX, cy = rect.midY
  for i in 0...steps {
    let t = CGFloat(i) / CGFloat(steps) * 2 * .pi
    let c = cos(t), s = sin(t)
    let x = cx + a * (c >= 0 ? 1 : -1) * pow(abs(c), 2 / n)
    let y = cy + b * (s >= 0 ? 1 : -1) * pow(abs(s), 2 / n)
    if i == 0 { path.move(to: CGPoint(x: x, y: y)) } else { path.addLine(to: CGPoint(x: x, y: y)) }
  }
  path.closeSubpath()
  return path
}

let space = CGColorSpace(name: CGColorSpace.sRGB)!
let ctx = CGContext(
  data: nil, width: Int(size), height: Int(size), bitsPerComponent: 8, bytesPerRow: 0,
  space: space, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.setShouldAntialias(true)
ctx.clear(CGRect(x: 0, y: 0, width: size, height: size))

let stroke = size * 0.06
let margin = args.count > 3 ? CGFloat(Double(args[3]) ?? 0) : 0.06
let inset = size * margin + stroke / 2
let outer = CGRect(x: inset, y: inset, width: size - inset * 2, height: size - inset * 2)
let outerPath = squircle(outer)

// White screen inside the frame; everything outside stays transparent.
ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
ctx.addPath(outerPath)
ctx.fillPath()

// The dock: a filled squircle whose lower part is cut off by the frame (CoreGraphics y grows upward).
ctx.saveGState()
ctx.addPath(outerPath)
ctx.clip()
let dockW = outer.width * 0.7
let dockH = outer.height * 0.62
let dock = CGRect(x: outer.midX - dockW / 2, y: outer.minY - dockH * 0.55, width: dockW, height: dockH)
ctx.setFillColor(CGColor(red: 0, green: 0, blue: 0, alpha: 1))
ctx.addPath(squircle(dock))
ctx.fillPath()
ctx.restoreGState()

// The frame is the ring between two superellipses, filled even-odd: stroking a sampled path leaves seams.
let ring = CGMutablePath()
ring.addPath(squircle(outer.insetBy(dx: -stroke / 2, dy: -stroke / 2)))
ring.addPath(squircle(outer.insetBy(dx: stroke / 2, dy: stroke / 2)))
ctx.setFillColor(CGColor(red: 0, green: 0, blue: 0, alpha: 1))
ctx.addPath(ring)
ctx.fillPath(using: .evenOdd)

let image = ctx.makeImage()!
let rep = NSBitmapImageRep(cgImage: image)
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))
