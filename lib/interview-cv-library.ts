/** Definitions for the ten CV10 interactive topics and the five existing personal Python note collections.
 * Display-only: never replace images, BlockNote documents or progress.
 */
import type { InterviewBrief } from './interview-foundations';
type Row = readonly [string, string, string, string, string, string, string];
function fromRows(rows: readonly Row[]): Record<string, InterviewBrief> {
  return Object.fromEntries(rows.map(([key, term, definition, why, example, followUp, followUpAnswer]) =>
    [key, { term, definition, why, example, followUp, followUpAnswer }]
  )) as Record<string, InterviewBrief>;
}
export const cv10Interview = fromRows([
  [
    "binary",
    "Binary segmentation mask",
    "A binary segmentation mask is a two-class image whose values indicate whether each pixel belongs to a selected region.",
    "It separates foreground from background for later processing.",
    "For a hand image, mask 1 can indicate hand pixels and 0 the desk.",
    "Is a binary mask necessarily stored as 0 and 1?",
    "No. Depending on the operation it may use booleans, 0/1, or 0/255; the meaning is foreground versus background."
  ],
  [
    "masking",
    "Image masking and bitwise operations",
    "Image masking selects locations using a mask; bitwise operations combine the binary bits of integer values.",
    "They isolate regions and combine or subtract binary selections.",
    "For image [50,200,127] with selector [1,0,1], the selected result is [50,0,127].",
    "Why does image AND a 0/1 mask not necessarily preserve image values?",
    "Direct bitwise AND with integer 1 preserves only the least significant bit; use a mask argument or 0/255 operand for uint8 selection."
  ],
  [
    "erosion",
    "Erosion",
    "Erosion is a morphological operation that replaces each pixel with the minimum over a chosen neighbourhood for a flat structuring element.",
    "It removes small foreground details and can shrink binary regions.",
    "A 3×3 all-ones square survives binary erosion only where all nine checked positions are foreground.",
    "What happens at an image border?",
    "The chosen border rule matters; OpenCV morphology defaults to operation-neutral border values for its standard border setting."
  ],
  [
    "dilation",
    "Dilation",
    "Dilation is a morphological operation that replaces each pixel with the maximum over a chosen neighbourhood for a flat structuring element.",
    "It expands binary foreground regions and can bridge nearby gaps.",
    "With a centred 3×3 square, a single foreground pixel can activate nearby output pixels.",
    "Is dilation the same as blurring?",
    "No. It chooses a neighbourhood maximum rather than averaging intensities."
  ],
  [
    "opening",
    "Morphological opening",
    "Opening means erosion followed by dilation with a structuring element.",
    "It can remove small foreground noise while preserving larger shapes better than erosion alone.",
    "A small isolated foreground dot disappears if it cannot survive the erosion step.",
    "Does opening mean dilation then erosion?",
    "No. Erosion then dilation is opening; the reverse order is closing."
  ],
  [
    "closing",
    "Morphological closing",
    "Closing means dilation followed by erosion with a structuring element.",
    "It can fill small holes or connect narrow gaps in foreground regions.",
    "A small background gap may disappear after dilation and the following erosion.",
    "Is closing the inverse of opening?",
    "No. The operations differ in order and effects; one does not simply undo the other."
  ],
  [
    "gradient",
    "Morphological gradient",
    "The morphological gradient is the difference between a dilated image and its eroded image, using the same structuring element.",
    "It highlights boundaries and transitions in intensity or binary regions.",
    "For a binary mask, dilation minus erosion highlights a band near the boundary.",
    "Is it the same as the Sobel gradient?",
    "No. Sobel estimates intensity derivatives; morphological gradient compares neighbourhood extrema."
  ],
  [
    "components",
    "Connected components",
    "A connected component is a maximal set of foreground pixels joined under a chosen neighbour rule.",
    "It separates disconnected objects in a binary mask.",
    "Two diagonal foreground pixels form two components under 4-connectivity but one under 8-connectivity.",
    "Does connectivity change the underlying pixels?",
    "No. It changes which neighbours count as belonging to the same region."
  ],
  [
    "regions",
    "Removing small connected regions",
    "Small-region removal labels connected foreground components and removes those whose pixel area is below a chosen threshold.",
    "It can eliminate isolated foreground specks while retaining larger components.",
    "With minimum area 3, components of areas 1, 3, and 4 retain only the latter two.",
    "Is contour area identical to component pixel count?",
    "No. Contour polygon area is geometric; connected-component area counts foreground pixels."
  ],
  [
    "contours",
    "Contour extraction",
    "A contour represents the traced boundary of a connected foreground shape, usually as ordered image coordinates.",
    "It supports shape measurement and boundary visualization.",
    "cv2.findContours can return a list of boundary point sequences and their hierarchy.",
    "Does contourArea equal the number of foreground pixels?",
    "No. It computes the geometric polygon area of the contour, which can differ from pixel count."
  ]
]);
export const libraryInterview = fromRows([
  [
    "Python Fundamentals",
    "Python list",
    "A list is an ordered, mutable Python collection of objects; it can hold items of different types.",
    "You use lists when the number of items may change or when you need indexed access.",
    "image_names = ['01.jpg', '02.jpg'] stores two filenames.",
    "What is the difference between a list, tuple and array?",
    "A list is mutable and may mix types; a tuple's elements cannot be reassigned; a NumPy array has a homogeneous dtype and supports fast numerical array operations."
  ],
  [
    "NumPy Essentials",
    "Array and NumPy ndarray",
    "An array is an indexed collection of elements. A NumPy ndarray is a multidimensional numerical array whose elements share one dtype and whose dimensions are described by its shape.",
    "Arrays represent images, vectors, matrices and batches for numerical computation.",
    "np.array([[1,2],[3,4]], dtype=np.uint8) has shape (2,2), ndim 2 and four elements.",
    "How is a Python list different from a NumPy array?",
    "A list may mix Python object types and does not perform NumPy-style elementwise arithmetic; an ndarray has one dtype and provides vectorized operations. NumPy views can be non-contiguous."
  ],
  [
    "NumPy for Computer Vision",
    "Image array",
    "A digital image can be represented as a NumPy array of pixel values with a defined shape, dtype and channel order.",
    "These properties determine how OpenCV and machine-learning models interpret an image.",
    "A colour HWC image may have shape (224,224,3), while grayscale often has shape (224,224).",
    "What does image[10,20,:] mean for HWC?",
    "It selects all channel values at row 10, column 20; the first index is y, the second is x."
  ],
  [
    "File Handling",
    "File handling",
    "File handling is the process of opening, reading, writing and closing files through program interfaces.",
    "It is needed to load inputs, record outputs and preserve results between program runs.",
    "with open('log.txt','r',encoding='utf-8') as file: text=file.read() reads and closes safely.",
    "Why use with rather than leaving open files around?",
    "The context manager releases the file automatically after the block, even if an error occurs inside."
  ],
  [
    "Python Coding Interviews",
    "Algorithm and data structure",
    "An algorithm is a finite step-by-step procedure for a task; a data structure organizes data for access and updates.",
    "Interviews test whether you can choose an appropriate structure and explain correctness and efficiency.",
    "Counting occurrences can use a dictionary to map each item to its count.",
    "Why discuss time and space complexity?",
    "They describe how processing time and memory use scale with input size, revealing trade-offs between solutions."
  ]
]);
