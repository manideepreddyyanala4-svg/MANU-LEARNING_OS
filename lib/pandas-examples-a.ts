import type { PythonCodeExample } from './python-roadmap-code-a';
export const pandasExamplesA: Record<string, PythonCodeExample[]> = {
  "01": [
    {
      "label": "Read CSV with pandas",
      "anchor": "read-csv",
      "code": "import pandas as pd\nfrom io import StringIO\n\ntext = 'id,score\\nP01,80\\nP02,95\\n'\ndf = pd.read_csv(StringIO(text))\nprint(df['id'].tolist())\nprint(df['score'].tolist())",
      "output": "['P01', 'P02']\n[80, 95]",
      "explanation": "A CSV is a table stored as text, with commas separating columns.\npd.read_csv reads that table into a DataFrame.\nChoose a column with df['column_name']; here we read image IDs and scores."
    },
    {
      "label": "Read an Excel .xlsx sheet",
      "anchor": "read-excel",
      "code": "import pandas as pd\nfrom io import BytesIO\n\nsource = pd.DataFrame({'id': ['P01', 'P02'], 'score': [80, 95]})\nfile = BytesIO()\nsource.to_excel(file, index=False, engine='openpyxl')\nfile.seek(0)\nloaded = pd.read_excel(file, engine='openpyxl')\nprint(loaded['id'].tolist())",
      "output": "['P01', 'P02']",
      "explanation": "to_excel saves a DataFrame as an Excel .xlsx workbook.\nread_excel loads it back; openpyxl is the Excel file engine.\nBytesIO keeps the demonstration in memory. A real file can be loaded with pd.read_excel('data.xlsx')."
    },
    {
      "label": "Read JSON records",
      "anchor": "read-json",
      "code": "import pandas as pd\nfrom io import StringIO\n\ntext = '[{\"id\":\"P01\",\"score\":80},{\"id\":\"P02\",\"score\":95}]'\ndf = pd.read_json(StringIO(text), orient='records')\nprint(df['id'].tolist())\nprint(df['score'].sum())",
      "output": "['P01', 'P02']\n175",
      "explanation": "JSON can contain a list of records with named fields.\npd.read_json converts those records into rows and columns.\nThe score column can be used directly for calculations."
    }
  ],
  "02": [
    {
      "label": "Create a DataFrame from a dictionary",
      "anchor": "dataframe-basics",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'name': ['A', 'B'], 'score': [80, 90]})\nprint(df.shape)\nprint(df.columns.tolist())",
      "output": "(2, 2)\n['name', 'score']",
      "explanation": "A DataFrame is a two-dimensional table.\nHere it contains two rows and two named columns.\nshape tells you (rows, columns), useful when auditing a dataset."
    },
    {
      "label": "Series is one column",
      "anchor": "series-basics",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'id': ['P01', 'P02'], 'score': [70, 90]})\nscores = df['score']\nprint(type(scores).__name__)\nprint(scores.tolist())",
      "output": "Series\n[70, 90]",
      "explanation": "df['score'] selects one named column.\nOne Pandas column is a Series, not a full DataFrame.\nto_list or tolist displays its values in a normal Python list."
    },
    {
      "label": "Inspect dtypes",
      "anchor": "dtypes",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'id': ['P01'], 'score': [0.9], 'valid': [True]})\nprint(df['id'].dtype)\nprint(df['score'].dtype)\nprint(df['valid'].dtype)",
      "output": "object\nfloat64\nbool",
      "explanation": "dtype describes the type of values stored in a column.\nText commonly uses object (in pandas 2.x); scores here use float64.\nCheck dtypes before cleaning numeric or label data."
    },
    {
      "label": "Summary statistics with describe",
      "anchor": "describe",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'score': [10, 20, 30]})\nsummary = df['score'].describe()\nprint(summary['count'])\nprint(summary['mean'])\nprint(summary['max'])",
      "output": "3.0\n20.0\n30.0",
      "explanation": "describe summarizes a numeric column.\ncount tells how many non-missing scores exist; mean gives their average.\nmax shows the largest score, useful for spotting unexpected values."
    }
  ],
  "03": [
    {
      "label": "loc selects by label",
      "anchor": "loc",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'id': ['P01', 'P02'], 'score': [80, 90]})\ndf.index = ['first', 'second']\nprint(df.loc['second', 'id'])",
      "output": "P02",
      "explanation": "loc selects using row LABELS and column NAMES.\nHere the row label is 'second' and the column is 'id'.\nThis differs from iloc, which selects numerical positions."
    },
    {
      "label": "iloc selects by position",
      "anchor": "iloc",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'id': ['P01', 'P02'], 'score': [80, 90]})\nprint(df.iloc[0, 1])\nprint(df.iloc[1, 0])",
      "output": "80\nP02",
      "explanation": "iloc uses integer positions, starting at zero.\nRow 0, column 1 is score 80.\nRow 1, column 0 is ID P02."
    },
    {
      "label": "Boolean filter rows",
      "anchor": "boolean-filter",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'id': ['P01', 'P02', 'P03'], 'score': [60, 90, 80]})\npassed = df[df['score'] >= 80]\nprint(passed['id'].tolist())",
      "output": "['P02', 'P03']",
      "explanation": "df['score'] >= 80 creates True/False values for each row.\ndf[mask] keeps only rows with True.\nHere scores 90 and 80 pass."
    },
    {
      "label": "query filters using a readable expression",
      "anchor": "query",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'id': ['P01', 'P02'], 'score': [70, 95]})\nhigh = df.query('score > 90')\nprint(high['id'].tolist())",
      "output": "['P02']",
      "explanation": "query accepts a short expression as text.\nIt chooses rows whose score is greater than 90.\nUse standard boolean filtering when the expression is simpler to write directly."
    }
  ],
  "04": [
    {
      "label": "Detect missing values",
      "anchor": "isna",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'id': ['P01', 'P02', 'P03'], 'score': [0.9, None, 0.7]})\nprint(df['score'].isna().tolist())\nprint(int(df['score'].isna().sum()))",
      "output": "[False, True, False]\n1",
      "explanation": "None represents an unknown score here.\nisna marks missing entries as True.\nsum counts the missing entries: exactly one."
    },
    {
      "label": "Drop missing labels, not every missing value",
      "anchor": "dropna-subset",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'id': ['P01', None, 'P03'], 'score': [0.9, 0.8, None]})\nclean = df.dropna(subset=['id'])\nprint(clean['id'].tolist())",
      "output": "['P01', 'P03']",
      "explanation": "dropna removes rows containing missing values.\nsubset=['id'] says only missing IDs should cause removal.\nP03 is kept even though its score is missing; the decision is explicit."
    },
    {
      "label": "Fill an optional missing score",
      "anchor": "fillna",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'score': [0.9, None, 0.7]})\nclean = df['score'].fillna(0.0)\nprint(clean.tolist())",
      "output": "[0.9, 0.0, 0.7]",
      "explanation": "fillna replaces missing entries with a chosen value.\nHere an absent score becomes 0.0.\nDo not blindly fill missing research labels or use a test-set statistic to fill training data."
    },
    {
      "label": "Find and remove duplicate rows",
      "anchor": "duplicated",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'id': ['P01', 'P01', 'P02'], 'label': ['L', 'L', 'R']})\nprint(df.duplicated().tolist())\nclean = df.drop_duplicates()\nprint(clean['id'].tolist())",
      "output": "[False, True, False]\n['P01', 'P02']",
      "explanation": "duplicated marks rows that exactly repeat an earlier row.\ndrop_duplicates keeps the first copy by default.\nWhen duplicates depend on specific columns, pass subset=['id', 'label']."
    }
  ],
  "05": [
    {
      "label": "Convert string numbers safely",
      "anchor": "to-numeric",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'score': ['80', 'bad', '95']})\ndf['score'] = pd.to_numeric(df['score'], errors='coerce')\nprint(df['score'].notna().tolist())\nprint(df['score'].dropna().astype(int).tolist())",
      "output": "[True, False, True]\n[80, 95]",
      "explanation": "Numbers sometimes arrive as text from a CSV.\nto_numeric converts valid text and makes invalid text missing with errors='coerce'.\nCheck missing values and remove or correct invalid records before casting to int."
    },
    {
      "label": "Convert to the intended data type",
      "anchor": "astype",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'count': [1.0, 2.0, 3.0]})\ndf['count'] = df['count'].astype('int64')\nprint(df['count'].tolist())\nprint(df['count'].dtype)",
      "output": "[1, 2, 3]\nint64",
      "explanation": "astype changes a Series to a requested type.\nThe decimal values here represent whole numbers, so conversion is safe.\nCasting arbitrary decimals to int would truncate values, so validate first."
    },
    {
      "label": "Parse dates and detect invalid dates",
      "anchor": "to-datetime",
      "code": "import pandas as pd\n\nvalues = pd.Series(['2026-11-06', 'not-a-date'])\ndates = pd.to_datetime(values, errors='coerce')\nprint(dates.notna().tolist())\nprint(dates.iloc[0].year)",
      "output": "[True, False]\n2026",
      "explanation": "to_datetime converts correctly formatted date text into date/time values.\nBad dates become NaT (missing datetime) when errors='coerce'.\nDetect invalid dates before sorting or filtering by time."
    }
  ],
  "06": [
    {
      "label": "Count category labels with value_counts",
      "anchor": "value-counts",
      "code": "import pandas as pd\n\nlabels = pd.Series(['L', 'R', 'L', 'L', 'R'])\ncounts = labels.value_counts()\nprint(int(counts['L']))\nprint(int(counts['R']))",
      "output": "3\n2",
      "explanation": "value_counts counts occurrences of every label.\nThere are 3 left-hand labels and 2 right-hand labels.\nInspecting counts can expose class imbalance in a training dataset."
    },
    {
      "label": "Group and calculate the mean",
      "anchor": "groupby-mean",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'group': ['A', 'A', 'B'], 'score': [80, 100, 60]})\nmeans = df.groupby('group')['score'].mean()\nprint(means.to_dict())",
      "output": "{'A': 90.0, 'B': 60.0}",
      "explanation": "groupby divides the rows into groups based on a column.\nmean calculates the average score inside each group.\nA has average 90; B has average 60."
    },
    {
      "label": "Group and count the number of rows",
      "anchor": "groupby-size",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'person': ['P01', 'P01', 'P02'], 'path': ['a', 'b', 'c']})\ncounts = df.groupby('person').size()\nprint(counts.to_dict())",
      "output": "{'P01': 2, 'P02': 1}",
      "explanation": "groupby('person') puts each person's rows together.\nsize counts ALL rows per group, including those with missing values in other columns.\nThis checks how many images each identity contributes."
    },
    {
      "label": "Multiple aggregations with agg",
      "anchor": "groupby-agg",
      "code": "import pandas as pd\n\ndf = pd.DataFrame({'group': ['A', 'A', 'B'], 'score': [70, 90, 80]})\nreport = df.groupby('group')['score'].agg(['min', 'max'])\nprint(report.loc['A'].to_dict())",
      "output": "{'min': 70, 'max': 90}",
      "explanation": "agg asks for several summary calculations at once.\nFor group A, the smallest score is 70 and the largest is 90.\nUse this to audit ranges and unusual values by camera, class or session."
    }
  ],
  "07": [
    {
      "label": "Join two tables by a shared ID",
      "anchor": "merge",
      "code": "import pandas as pd\n\nimages = pd.DataFrame({'id': ['P01', 'P02'], 'path': ['a.jpg', 'b.jpg']})\npeople = pd.DataFrame({'id': ['P01', 'P02'], 'group': ['A', 'B']})\njoined = images.merge(people, on='id', validate='one_to_one')\nprint(joined[['id', 'group']].values.tolist())",
      "output": "[['P01', 'A'], ['P02', 'B']]",
      "explanation": "merge joins tables using matching ID values.\nvalidate='one_to_one' requires the ID to be unique in both tables.\nUse 'many_to_one' instead when several images belong to one person."
    },
    {
      "label": "Left join keeps rows without matches",
      "anchor": "left-join",
      "code": "import pandas as pd\n\nimages = pd.DataFrame({'id': ['P01', 'P99']})\npeople = pd.DataFrame({'id': ['P01'], 'group': ['A']})\njoined = images.merge(people, on='id', how='left', indicator=True)\nprint(joined['_merge'].astype(str).tolist())",
      "output": "['both', 'left_only']",
      "explanation": "A left join keeps all rows from the first table.\nP99 has no record in the second table, so its group would be missing.\nindicator=True tells you whether each row matched."
    },
    {
      "label": "Duplicate join keys can multiply rows",
      "anchor": "join-multiplication",
      "code": "import pandas as pd\n\nleft = pd.DataFrame({'id': ['P01', 'P01']})\nright = pd.DataFrame({'id': ['P01', 'P01', 'P01']})\nresult = left.merge(right, on='id')\nprint(len(left))\nprint(len(right))\nprint(len(result))",
      "output": "2\n3\n6",
      "explanation": "The left table has 2 P01 rows; the right table has 3.\nEach left row matches all 3 right rows.\nThe result has 2 × 3 = 6 rows, which can silently corrupt counts and metrics."
    },
    {
      "label": "Reject an unsafe join with validation",
      "anchor": "join-validate",
      "code": "import pandas as pd\n\nleft = pd.DataFrame({'id': ['P01', 'P01']})\nright = pd.DataFrame({'id': ['P01', 'P01']})\ntry:\n    left.merge(right, on='id', validate='many_to_one')\nexcept pd.errors.MergeError:\n    print('Duplicate person keys: join rejected')",
      "output": "Duplicate person keys: join rejected",
      "explanation": "many_to_one means duplicates are allowed on the left but not on the right.\nThe right table has repeated IDs, violating that rule.\nPandas raises MergeError, letting you repair the data before proceeding."
    }
  ]
};
