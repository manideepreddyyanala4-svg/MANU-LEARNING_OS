const titles = [
  'Kernel + Convolution', 'Edges + Gradient', 'Sobel / Scharr', 'Laplacian',
  'LoG / DoG', 'Canny', 'Thresholding', 'Morphology',
  'Resize / Interpolation / Model-input Preparation', 'CNN Fundamentals — Deep Study',
  'PyTorch — Deep Study', 'MobileNet / Lightweight CNN Blocks',
  'LAWNet + Own Project Architecture', 'Embeddings / Metric Learning / Biometric Verification',
  'YOLO + Detection Fundamentals', 'Segmentation Basics', 'Git + Linux',
  'DSA / Python Interview Coding', 'Deployment / ONNX', 'Modern CV / ViT / VLM Basics',
  'Full Interview Revision',
];

export const roadmap = titles.map((title, index) => ({
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  title,
  label: index === 0 ? 'CURRENT' : index === 1 ? 'UP NEXT' : 'ROADMAP',
  description: '',
}));
