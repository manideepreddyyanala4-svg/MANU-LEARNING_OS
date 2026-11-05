import type { PythonCodeExample } from './python-roadmap-code-a';
export const pandasExamplesC: Record<string, PythonCodeExample[]> = {
  "15": [
    {
      "label": "Record train, validation and test splits",
      "anchor": "split-column",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({\n    'path': ['a.jpg', 'b.jpg', 'c.jpg'],\n    'split': ['train', 'val', 'test']\n})\nprint(df['split'].value_counts().sort_index().to_dict())",
      "output": "{'test': 1, 'train': 1, 'val': 1}",
      "explanation": "Each image row gets a split label: train, validation or test.\nA split column makes evaluation membership explicit and reproducible.\nDo not move test samples into training just to improve performance."
    },
    {
      "label": "Check that person IDs do not cross splits",
      "anchor": "identity-leakage",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({\n    'identity': ['P01', 'P01', 'P02', 'P03'],\n    'split': ['train', 'train', 'val', 'test']\n})\nper_person = df.groupby('identity')['split'].nunique()\nprint((per_person > 1).any())",
      "output": "False",
      "explanation": "Group records by identity and count how many splits each person appears in.\nIf a person appears in more than one split, their count becomes greater than 1.\nFor an identity-disjoint evaluation, any such overlap is a leakage error. Protocols differ by task."
    },
    {
      "label": "Catch a leaking person identity",
      "anchor": "detect-leakage",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({\n    'identity': ['P01', 'P01', 'P02'],\n    'split': ['train', 'test', 'val']\n})\ncounts = df.groupby('identity')['split'].nunique()\nleaked = counts[counts > 1]\nprint(leaked.index.tolist())",
      "output": "['P01']",
      "explanation": "P01 appears once in training and once in testing.\nnunique finds two split labels for that identity.\nFor identity-disjoint testing, remove the overlap by constructing the split at person level."
    },
    {
      "label": "Create separate metadata tables for each split",
      "anchor": "export-split-manifests",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({\n    'file': ['a.jpg', 'b.jpg', 'c.jpg'],\n    'split': ['train', 'val', 'test']\n})\ntrain = df[df['split'] == 'train']\nval = df[df['split'] == 'val']\ntest = df[df['split'] == 'test']\nprint(train['file'].tolist())\nprint(val['file'].tolist())\nprint(test['file'].tolist())",
      "output": "['a.jpg']\n['b.jpg']\n['c.jpg']",
      "explanation": "Filter rows using their recorded split labels.\nSave each selected table separately when a model loader expects distinct manifests.\nPreserve the master manifest so you can always audit the split later."
    }
  ],
  "16": [
    {
      "label": "Verify that dataset files exist",
      "anchor": "check-files",
      "code": "from pathlib import Path\nfrom tempfile import TemporaryDirectory\n\nwith TemporaryDirectory() as folder:\n    root = Path(folder)\n    (root / 'a.jpg').write_bytes(b'demo')\n    for name in ['a.jpg', 'missing.jpg']:\n        print(name, (root / name).is_file())",
      "output": "a.jpg True\nmissing.jpg False",
      "explanation": "The example creates a temporary dummy file, not a real photograph.\nis_file checks whether each listed file exists.\nDetecting missing paths before training avoids failures halfway through an experiment."
    },
    {
      "label": "Calculate a SHA-256 checksum",
      "anchor": "checksum",
      "code": "import hashlib\n\ndata = b'hello'\nchecksum = hashlib.sha256(data).hexdigest()\nprint(len(checksum))\nprint(checksum[:8])",
      "output": "64\n2cf24dba",
      "explanation": "SHA-256 creates a fixed-length fingerprint of file bytes.\nThe full hexadecimal checksum contains 64 characters.\nChanging the file bytes changes its checksum with overwhelming probability."
    },
    {
      "label": "Find duplicate content even with different file names",
      "anchor": "duplicate-by-hash",
      "code": "import hashlib\n\nfiles = {'a.jpg': b'example', 'b.jpg': b'example', 'c.jpg': b'different'}\nseen = {}\nfor filename, data in files.items():\n    fingerprint = hashlib.sha256(data).hexdigest()\n    if fingerprint in seen:\n        print(filename, 'matches', seen[fingerprint])\n    else:\n        seen[fingerprint] = filename",
      "output": "b.jpg matches a.jpg",
      "explanation": "Two differently named files can contain identical bytes.\nHash each file and remember its first occurrence.\nRepeated hashes flag exact-byte duplicates for review; resized or recompressed images need other comparisons."
    },
    {
      "label": "Report missing file records in a manifest",
      "anchor": "missing-file-report",
      "code": "import pandas as pd\n\nmanifest = pd.DataFrame({'file': ['a.jpg', 'b.jpg', 'c.jpg'], 'exists': [True, False, True]})\nmissing = manifest[manifest['exists'] == False]\nprint(missing['file'].tolist())",
      "output": "['b.jpg']",
      "explanation": "A file-existence check can be saved as a Boolean column.\nFilter rows where exists is False.\nReview those paths rather than silently dropping or relabeling the associated samples."
    }
  ],
  "17": [
    {
      "label": "Excel basic formula: SUM and AVERAGE",
      "anchor": "excel-formulas",
      "code": "from openpyxl import Workbook\n\nbook = Workbook()\nsheet = book.active\nsheet['A1'] = 10\nsheet['A2'] = 20\nsheet['A3'] = '=SUM(A1:A2)'\nsheet['A4'] = '=AVERAGE(A1:A2)'\nprint(sheet['A3'].value)\nprint(sheet['A4'].value)",
      "output": "=SUM(A1:A2)\n=AVERAGE(A1:A2)",
      "explanation": "Excel SUM adds a range of numeric cells; AVERAGE calculates their mean.\nFormulas begin with an equals sign, and cells are referenced by column letter and row number.\nopenpyxl writes formula text but does NOT calculate formulas itself; Excel or another spreadsheet engine calculates them."
    },
    {
      "label": "Excel filter range and worksheet headers",
      "anchor": "excel-filter",
      "code": "from openpyxl import Workbook\n\nbook = Workbook()\nsheet = book.active\nsheet.append(['id', 'score'])\nsheet.append(['P01', 70])\nsheet.append(['P02', 90])\nsheet.auto_filter.ref = 'A1:B3'\nprint(sheet.auto_filter.ref)\nprint(sheet['B3'].value)",
      "output": "A1:B3\n90",
      "explanation": "The first row contains column headings.\nAn Excel AutoFilter is configured for the rectangle A1:B3.\nThe filter controls appear when the workbook is opened in a spreadsheet application; this code does not filter rows by itself."
    },
    {
      "label": "Excel lookup concept with XLOOKUP formula",
      "anchor": "excel-lookup",
      "code": "from openpyxl import Workbook\n\nbook = Workbook()\nsheet = book.active\nsheet['D2'] = '=XLOOKUP(A2,$A$2:$A$3,$B$2:$B$3,\"Missing\")'\nprint(sheet['D2'].value)",
      "output": "=XLOOKUP(A2,$A$2:$A$3,$B$2:$B$3,\"Missing\")",
      "explanation": "XLOOKUP searches for A2 in the lookup range A2:A3.\nIt returns the matching value from the corresponding B-column row.\n$ keeps a range fixed when the formula is copied. openpyxl stores this formula; Excel calculates it."
    },
    {
      "label": "Pivot table idea: aggregate by category",
      "anchor": "pivot-table",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'class': ['A', 'A', 'B'], 'score': [10, 20, 30]})\nsummary = df.pivot_table(index='class', values='score', aggfunc='sum')\nprint(summary['score'].to_dict())",
      "output": "{'A': 30, 'B': 30}",
      "explanation": "A pivot table summarizes many rows by selected categories.\nHere scores are summed for each class.\nA Pandas pivot_table uses the same fundamental grouping idea as an Excel PivotTable."
    }
  ],
  "18": [
    {
      "label": "Make a simple line plot",
      "anchor": "plot-line",
      "code": "import matplotlib\nmatplotlib.use('Agg')\nimport matplotlib.pyplot as plt\nfrom io import BytesIO\n\nplt.plot([1, 2, 3], [60, 75, 90])\nplt.xlabel('Epoch')\nplt.ylabel('Accuracy')\nimage = BytesIO()\nplt.savefig(image, format='png')\nprint(len(image.getvalue()) > 0)\nplt.close()",
      "output": "True",
      "explanation": "A line graph connects values in order, useful for tracking changes across epochs or time.\nplot receives X positions and Y measurements.\nsavefig exports the figure; BytesIO keeps this example in memory rather than writing a file."
    },
    {
      "label": "Make a bar chart for class counts",
      "anchor": "plot-bar",
      "code": "import matplotlib\nmatplotlib.use('Agg')\nimport matplotlib.pyplot as plt\nfrom io import BytesIO\n\nplt.bar(['A', 'B'], [20, 10])\nplt.ylabel('Images')\nimage = BytesIO()\nplt.savefig(image, format='png')\nprint(len(image.getvalue()) > 0)\nplt.close()",
      "output": "True",
      "explanation": "Bar charts compare values across named categories.\nHere class A has 20 images and class B has 10.\nThis is helpful for visualizing label imbalance."
    },
    {
      "label": "Use a histogram for numerical values",
      "anchor": "plot-hist",
      "code": "import matplotlib\nmatplotlib.use('Agg')\nimport matplotlib.pyplot as plt\nfrom io import BytesIO\n\nplt.hist([0.1, 0.2, 0.2, 0.8, 0.9], bins=3)\nplt.xlabel('Score')\nimage = BytesIO()\nplt.savefig(image, format='png')\nprint(len(image.getvalue()) > 0)\nplt.close()",
      "output": "True",
      "explanation": "Histograms group numerical measurements into ranges (bins).\nThe height of each bar shows how many scores fall into that interval.\nUse them to inspect distributions rather than only the average."
    },
    {
      "label": "Scatter plot for two measurements",
      "anchor": "plot-scatter",
      "code": "import matplotlib\nmatplotlib.use('Agg')\nimport matplotlib.pyplot as plt\nfrom io import BytesIO\n\nplt.scatter([1, 2, 3], [3, 4, 6])\nplt.xlabel('Size')\nplt.ylabel('Time')\nimage = BytesIO()\nplt.savefig(image, format='png')\nprint(len(image.getvalue()) > 0)\nplt.close()",
      "output": "True",
      "explanation": "Each dot represents one pair of measurements.\nScatter plots help spot relationships, clusters and unusual points.\nThis example plots three small measurement pairs."
    }
  ],
  "19": [
    {
      "label": "Build a confusion matrix with crosstab",
      "anchor": "confusion-matrix",
      "code": "import pandas as pd\n\nactual = ['cat', 'cat', 'dog', 'dog']\npredicted = ['cat', 'dog', 'dog', 'dog']\nmatrix = pd.crosstab(pd.Series(actual), pd.Series(predicted))\nprint(matrix.loc[['cat', 'dog'], ['cat', 'dog']].values.tolist())",
      "output": "[[1, 1], [0, 2]]",
      "explanation": "Rows represent the true class; columns represent the predicted class.\nOne cat was predicted correctly and one cat was mistaken for a dog.\nBoth dogs were predicted correctly, giving the shown 2×2 matrix."
    },
    {
      "label": "Compute overall accuracy from counts",
      "anchor": "accuracy-counts",
      "code": "import pandas as pd\n\nactual = ['A', 'A', 'B', 'B']\npredicted = ['A', 'B', 'B', 'B']\ndf = pd.DataFrame({'actual': actual, 'predicted': predicted})\ncorrect = (df['actual'] == df['predicted']).sum()\naccuracy = correct / len(df)\nprint(correct)\nprint(accuracy)",
      "output": "3\n0.75",
      "explanation": "Compare the true and predicted labels row by row.\nThree of the four predictions match.\nAccuracy is correct predictions divided by total predictions: 3/4 = 0.75."
    },
    {
      "label": "Plot a confusion matrix with Matplotlib",
      "anchor": "plot-confusion",
      "code": "import matplotlib\nmatplotlib.use('Agg')\nimport matplotlib.pyplot as plt\nfrom io import BytesIO\n\nmatrix = [[5, 1], [2, 4]]\nplt.imshow(matrix)\nplt.xticks([0, 1], ['A', 'B'])\nplt.yticks([0, 1], ['A', 'B'])\nimage = BytesIO()\nplt.savefig(image, format='png')\nprint(len(image.getvalue()) > 0)\nplt.close()",
      "output": "True",
      "explanation": "imshow displays the numeric confusion matrix as an image.\nEach position corresponds to a true/predicted class combination.\nUse color and labels to locate systematic class-confusion patterns."
    },
    {
      "label": "Report a class distribution before training",
      "anchor": "class-distribution",
      "code": "import pandas as pd\n\nlabels = pd.Series(['A', 'A', 'A', 'B'])\ncounts = labels.value_counts().sort_index()\nprint(counts.to_dict())\nprint(counts.min())",
      "output": "{'A': 3, 'B': 1}\n1",
      "explanation": "Count examples per class before fitting a model.\nHere class B has only one sample, compared with three for A.\nReport this imbalance because high overall accuracy might hide weak performance on B."
    }
  ],
  "20": [
    {
      "label": "Remove private fields from a shareable table",
      "anchor": "privacy-columns",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'identity': ['P01'], 'email': ['fake@example.org'], 'score': [0.9]})\npublic = df.drop(columns=['email'])\nprint(public.columns.tolist())",
      "output": "['identity', 'score']",
      "explanation": "Private contact fields should not be included unless actually needed and authorized.\ndrop removes an unwanted column before exporting a sanitized table.\nA pseudonymous identity code is still potentially linkable; consider removing or replacing it too."
    },
    {
      "label": "Allowlist only fields needed for sharing",
      "anchor": "privacy-allowlist",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'filename': ['a.jpg'], 'label': ['L'], 'contact': ['demo@invalid.test']})\nallowed = ['label']\nshareable = df[allowed].copy()\nprint(shareable.to_dict('records'))",
      "output": "[{'label': 'L'}]",
      "explanation": "An allowlist selects only the fields you are permitted to share.\nCopying the selected columns avoids accidentally exporting unrelated sensitive metadata.\nReview file paths, identities, raw biometric images and annotations separately before publication."
    },
    {
      "label": "Avoid identity overlap between training and testing",
      "anchor": "privacy-and-leakage",
      "code": "import pandas as pd\n\ntrain = pd.DataFrame({'identity': ['P01', 'P02']})\ntest = pd.DataFrame({'identity': ['P02', 'P03']})\noverlap = set(train['identity']) & set(test['identity'])\nprint(sorted(overlap))",
      "output": "['P02']",
      "explanation": "P02 appears in both datasets.\nFor identity-disjoint recognition evaluation, this could make measured results too optimistic.\nCreate partitions based on identity and check them before training."
    },
    {
      "label": "Learn a statistic from TRAINING data only",
      "anchor": "train-only-normalization",
      "code": "import pandas as pd\n\ntrain = pd.Series([10.0, 20.0, 30.0])\ntest = pd.Series([100.0])\ntrain_mean = train.mean()\ntrain_normalized = train - train_mean\ntest_normalized = test - train_mean\nprint(train_mean)\nprint(train_normalized.tolist())\nprint(test_normalized.tolist())",
      "output": "20.0\n[-10.0, 0.0, 10.0]\n[80.0]",
      "explanation": "Calculate preprocessing statistics from training samples ONLY.\nUse those stored training statistics to transform validation and test samples.\nIf you calculate statistics using test data, information leaks into your evaluation."
    }
  ]
};
