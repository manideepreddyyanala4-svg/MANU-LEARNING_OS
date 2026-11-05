import type { PythonCodeExample } from './python-roadmap-code-a';
export const pandasExamplesB: Record<string, PythonCodeExample[]> = {
  "10": [
    {
      "label": "Build a basic image dataset manifest",
      "anchor": "manifest-basics",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({\n    'path': ['images/p01_l.jpg', 'images/p01_r.jpg'],\n    'label': ['left', 'right'],\n    'identity': ['P01', 'P01']\n})\nprint(df.columns.tolist())\nprint(len(df))",
      "output": "['path', 'label', 'identity']\n2",
      "explanation": "A manifest is a table that describes dataset files and labels.\nEach row points to one image and its related metadata.\nA consistent manifest simplifies loading, validation and dataset splitting."
    },
    {
      "label": "Track conditions such as indoor and outdoor",
      "anchor": "manifest-conditions",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({\n    'path': ['a.jpg', 'b.jpg', 'c.jpg'],\n    'person': ['P01', 'P01', 'P02'],\n    'condition': ['indoor', 'outdoor', 'indoor']\n})\nprint(df['condition'].value_counts().sort_index().to_dict())",
      "output": "{'indoor': 2, 'outdoor': 1}",
      "explanation": "The condition column records the environment in which each image was captured.\nCounting conditions helps find an uneven indoor/outdoor distribution.\nKeep acquisition-condition metadata separate from a person's true identity."
    },
    {
      "label": "Check for missing manifest columns",
      "anchor": "manifest-required-columns",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'path': ['a.jpg'], 'identity': ['P01']})\nrequired = {'path', 'identity', 'condition'}\nmissing = required - set(df.columns)\nprint(sorted(missing))",
      "output": "['condition']",
      "explanation": "Define the fields that a training pipeline needs.\nCompare the required names with actual DataFrame columns.\nIf a column is missing, fix the manifest before feeding it into the model."
    },
    {
      "label": "Save manifest as a CSV",
      "anchor": "manifest-to-csv",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'path': ['a.jpg', 'b.jpg'], 'identity': ['P01', 'P02']})\ntext = df.to_csv(index=False)\nprint(text.strip())",
      "output": "path,identity\na.jpg,P01\nb.jpg,P02",
      "explanation": "to_csv exports a table to ordinary text.\nindex=False avoids adding the internal row index as an unwanted column.\nA manifest CSV can be reloaded by the same code during training and testing."
    }
  ],
  "11": [
    {
      "label": "Use stable identity IDs, not the row number",
      "anchor": "stable-identity",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'image': ['a.jpg', 'b.jpg'], 'identity': ['P01', 'P01']})\nprint(df.loc[0, 'identity'])\nprint(df.loc[1, 'identity'])",
      "output": "P01\nP01",
      "explanation": "Two different image rows belong to the SAME person.\nThe identity label should remain P01 across both files.\nRow indexes such as 0 and 1 are not reliable identity labels."
    },
    {
      "label": "Normalize file-name text consistently",
      "anchor": "normalize-file-name",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'file': [' P01_L.JPG ', 'p02_r.jpg']})\ndf['file'] = df['file'].str.strip().str.lower()\nprint(df['file'].tolist())",
      "output": "['p01_l.jpg', 'p02_r.jpg']",
      "explanation": "strip removes unwanted spaces at the start and end.\nlower standardizes the capitalization.\nConsistent names reduce accidental mismatches; do not overwrite real files without checking collisions."
    },
    {
      "label": "Detect duplicate file identifiers",
      "anchor": "duplicate-paths",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'file': ['p01_l.jpg', 'p01_l.jpg', 'p02_r.jpg']})\nduplicates = df['file'].duplicated()\nprint(duplicates.tolist())",
      "output": "[False, True, False]",
      "explanation": "Each file name should normally refer to a unique image record.\nduplicated flags the second appearance of the same file name.\nInvestigate duplicates rather than assuming every repeated record is harmless."
    },
    {
      "label": "Separate identity from image session",
      "anchor": "identity-session",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({\n    'identity': ['P01', 'P01'],\n    'session': ['morning', 'evening'],\n    'image': ['a.jpg', 'b.jpg']\n})\nprint(df['identity'].nunique())\nprint(df['session'].nunique())",
      "output": "1\n2",
      "explanation": "Both images belong to one person, even though there are two sessions.\nnunique counts distinct values in a column.\nTreat session/camera/condition as separate metadata, not as extra identities."
    }
  ],
  "12": [
    {
      "label": "Reject invalid class labels",
      "anchor": "validate-labels",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'label': ['left', 'right', 'unknown', 'LEFT']})\nvalid = {'left', 'right'}\nclean = df['label'].str.lower()\nprint(clean.isin(valid).tolist())",
      "output": "[True, True, False, True]",
      "explanation": "Choose the allowed class labels before checking the data.\nNormalize case when that is permitted by your labeling protocol.\nisin returns False for labels outside the approved set."
    },
    {
      "label": "Count images in each class",
      "anchor": "class-counts",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'label': ['A', 'A', 'A', 'B']})\ncounts = df['label'].value_counts().sort_index()\nprint(counts.to_dict())",
      "output": "{'A': 3, 'B': 1}",
      "explanation": "value_counts tells you how many samples belong to each class.\nClass A has three samples; class B has only one.\nUneven counts can affect training and the interpretation of accuracy."
    },
    {
      "label": "Class imbalance ratio",
      "anchor": "imbalance-ratio",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'label': ['A', 'A', 'A', 'A', 'B']})\ncounts = df['label'].value_counts()\nratio = counts.max() / counts.min()\nprint(ratio)",
      "output": "4.0",
      "explanation": "The most frequent class has four examples.\nThe least frequent class has one example.\nThe largest-to-smallest count ratio is 4:1, a simple imbalance indicator."
    },
    {
      "label": "Check every identity has enough images",
      "anchor": "identity-min-count",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'identity': ['P01', 'P01', 'P02']})\ncounts = df.groupby('identity').size()\ntoo_few = counts[counts < 2]\nprint(too_few.index.tolist())",
      "output": "['P02']",
      "explanation": "Count image rows separately for each person.\nRequire at least two images per identity in this example.\nP02 has only one image, so it is flagged for a dataset review."
    }
  ],
  "13": [
    {
      "label": "Bounding box: x, y, width and height",
      "anchor": "bounding-box",
      "code": "import pandas as pd\n\nbox = pd.DataFrame({'x': [10], 'y': [20], 'width': [30], 'height': [40]})\nright = box.loc[0, 'x'] + box.loc[0, 'width']\nbottom = box.loc[0, 'y'] + box.loc[0, 'height']\nprint(right)\nprint(bottom)",
      "output": "40\n60",
      "explanation": "A bounding box describes a rectangular region.\nWith x=10 and width=30, its right edge is at 40.\nWith y=20 and height=40, its bottom edge is at 60. Other formats may use x1,y1,x2,y2."
    },
    {
      "label": "Landmark points store x and y coordinates",
      "anchor": "landmarks",
      "code": "import pandas as pd\n\npoints = pd.DataFrame({'point_id': [0, 1], 'x': [12, 25], 'y': [18, 30]})\nprint(points[['x', 'y']].values.tolist())",
      "output": "[[12, 18], [25, 30]]",
      "explanation": "A landmark is a specific point such as a hand joint.\nEach point has its own x and y coordinates.\nKeep the coordinate convention and point numbering consistent across images."
    },
    {
      "label": "Segmentation mask stores pixel categories",
      "anchor": "segmentation-mask",
      "code": "import numpy as np\n\nmask = np.array([[0, 1, 1], [0, 0, 1]], dtype=np.uint8)\nprint(mask.shape)\nprint(int(mask.sum()))",
      "output": "(2, 3)\n3",
      "explanation": "A binary mask has one label for each pixel position.\nHere 1 means foreground and 0 means background.\nSumming the mask counts the three foreground pixels."
    },
    {
      "label": "Keep annotation types separate",
      "anchor": "annotation-schema",
      "code": "import pandas as pd\n\nannotations = pd.DataFrame({\n    'image': ['a.jpg', 'b.jpg', 'c.jpg'],\n    'type': ['box', 'mask', 'landmarks']\n})\nprint(annotations['type'].tolist())",
      "output": "['box', 'mask', 'landmarks']",
      "explanation": "Bounding boxes, masks and landmarks represent different kinds of annotation.\nSave annotation format information in the dataset metadata.\nA model loader must know which format it expects before reading coordinates or pixels."
    }
  ],
  "14": [
    {
      "label": "Convert a CSV to JSON records",
      "anchor": "csv-to-json",
      "code": "import pandas as pd\nfrom io import StringIO\n\ncsv_text = 'id,score\\nP01,80\\nP02,90\\n'\ndf = pd.read_csv(StringIO(csv_text))\njson_text = df.to_json(orient='records')\nprint(json_text)",
      "output": "[{\"id\":\"P01\",\"score\":80},{\"id\":\"P02\",\"score\":90}]",
      "explanation": "read_csv parses the CSV into rows and columns.\nto_json(orient='records') creates a list of JSON objects.\nEach object's fields use the column names as keys."
    },
    {
      "label": "Check required fields in JSON records",
      "anchor": "json-schema-check",
      "code": "records = [\n    {'id': 'P01', 'label': 'left'},\n    {'id': 'P02'}\n]\nrequired = {'id', 'label'}\nfor record in records:\n    valid = required.issubset(record.keys())\n    print(valid)",
      "output": "True\nFalse",
      "explanation": "Declare the fields required for every record.\nissubset checks whether each record contains those keys.\nThe second record is missing its label and fails validation."
    },
    {
      "label": "Write JSON with readable indentation",
      "anchor": "json-indentation",
      "code": "import json\n\nrecord = {'id': 'P01', 'label': 'left'}\ntext = json.dumps(record, indent=2)\nprint(text)",
      "output": "{\n  \"id\": \"P01\",\n  \"label\": \"left\"\n}",
      "explanation": "json.dumps converts a Python dictionary into JSON text.\nindent=2 makes the output easier for humans to read.\nJSON uses text keys and values; keep schema and value types consistent."
    },
    {
      "label": "Avoid turning invalid numbers into JSON",
      "anchor": "json-nan",
      "code": "import json\n\nrecord = {'id': 'P01', 'score': 0.9}\ntext = json.dumps(record, allow_nan=False)\nprint(text)",
      "output": "{\"id\": \"P01\", \"score\": 0.9}",
      "explanation": "allow_nan=False requires standards-compliant numeric JSON values.\nNaN or Infinity would raise an error instead of being silently written.\nValidate or remove invalid numeric values before exporting."
    }
  ],
  "08": [
    {
      "label": "Sort scores from highest to lowest",
      "anchor": "sort-values",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'id': ['P01', 'P02', 'P03'], 'score': [70, 95, 80]})\nordered = df.sort_values('score', ascending=False)\nprint(ordered['id'].tolist())",
      "output": "['P02', 'P03', 'P01']",
      "explanation": "sort_values orders rows using a named column.\nascending=False starts from the largest score.\nThe first ID has the highest score, 95."
    },
    {
      "label": "Rank scores without losing the original order",
      "anchor": "rank",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'id': ['A', 'B', 'C'], 'score': [80, 95, 80]})\ndf['rank'] = df['score'].rank(ascending=False, method='min')\nprint(df['rank'].astype(int).tolist())",
      "output": "[2, 1, 2]",
      "explanation": "rank assigns positions based on scores; higher scores receive smaller rank numbers.\nB is rank 1 with score 95.\nA and C tie at rank 2 because method='min' gives equal scores the same smallest rank."
    },
    {
      "label": "Find outliers using a simple range rule",
      "anchor": "outlier-rule",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'score': [10, 12, 11, 250]})\noutliers = df[df['score'] > 100]\nprint(outliers['score'].tolist())",
      "output": "[250]",
      "explanation": "A rule selects values beyond an expected range.\nHere scores greater than 100 are treated as suspicious.\nReal-world limits depend on the meaning of the measurement; do not remove valid data blindly."
    },
    {
      "label": "IQR method for unusual values",
      "anchor": "iqr-outliers",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'value': [10, 11, 12, 13, 14, 100]})\nq1 = df['value'].quantile(0.25)\nq3 = df['value'].quantile(0.75)\niqr = q3 - q1\nlimit = q3 + 1.5 * iqr\nprint((df['value'] > limit).tolist())",
      "output": "[False, False, False, False, False, True]",
      "explanation": "Q1 and Q3 describe the middle half of the data.\nIQR = Q3 − Q1 measures that spread.\nValues above Q3 + 1.5×IQR are flagged as potential outliers, not automatically incorrect."
    }
  ],
  "09": [
    {
      "label": "Simple Python loop for a calculated column",
      "anchor": "python-loop-column",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'score': [10, 20, 30]})\nnew_scores = []\nfor score in df['score']:\n    new_scores.append(score * 2)\ndf['doubled'] = new_scores\nprint(df['doubled'].tolist())",
      "output": "[20, 40, 60]",
      "explanation": "Read one score at a time using a Python for loop.\nMultiply each score by 2 and store it in a new list.\nAssign the list to a new DataFrame column."
    },
    {
      "label": "Pandas vectorization without a Python loop",
      "anchor": "vectorized-column",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'score': [10, 20, 30]})\ndf['doubled'] = df['score'] * 2\nprint(df['doubled'].tolist())",
      "output": "[20, 40, 60]",
      "explanation": "Pandas performs arithmetic on the entire Series at once.\nYou do not have to write the loop yourself.\nFor large numeric datasets, vectorized operations are commonly faster and easier to read."
    },
    {
      "label": "apply uses a function on each value",
      "anchor": "apply",
      "code": "import pandas as pd\n\ndef label_score(score):\n    if score >= 80:\n        return 'high'\n    return 'low'\n\ndf = pd.DataFrame({'score': [70, 90, 80]})\ndf['level'] = df['score'].apply(label_score)\nprint(df['level'].tolist())",
      "output": "['low', 'high', 'high']",
      "explanation": "Define a normal Python function that returns a label.\napply calls that function for each score in the Series.\nFor straightforward numeric arithmetic, prefer vectorized expressions instead of Python apply."
    },
    {
      "label": "Vectorized conditional labels using where",
      "anchor": "where",
      "code": "import pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({'score': [70, 90, 80]})\ndf['level'] = np.where(df['score'] >= 80, 'high', 'low')\nprint(df['level'].tolist())",
      "output": "['low', 'high', 'high']",
      "explanation": "The condition df['score'] >= 80 is checked for every row.\nnp.where chooses 'high' when True and 'low' when False.\nThis avoids calling a Python function separately for simple conditions."
    }
  ]
};
