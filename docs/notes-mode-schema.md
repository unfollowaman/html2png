# Render Flow Notes Mode - JSON Schema Documentation

This document describes the JSON schema structure for Render Flow's **Notes Mode** feature. It specifies the Phase 1 implementation subset as well as the full target schema planned for subsequent phases.

---

## Overview & Status Delineation

Render Flow Notes Mode accepts structured JSON describing formatted study notes, formula sheets, chapter summaries, and step-by-step solutions, which are paginated and rendered onto A4 single-page cards.

| Schema Section / Item Type | Status | Description |
| :--- | :--- | :--- |
| **`chapter.title`** | **Phase 1 Implemented** | Main heading string displayed in A4 header. |
| **`chapter.subtitle`** | **Phase 1 Implemented** | Subheading string displayed in A4 header. |
| **`pages`** | **Phase 1 Implemented** | Array of page objects containing rendered items. |
| **`question` item type** | **Phase 1 Implemented** | Card pair representing a problem and solution. |
| **`text` content element** | **Phase 1 Implemented** | Inline text paragraph inside question or solution. |
| **`equation` component** | *Planned (Phase 2+)* | Isolated LaTeX math block. |
| **`coordinate_graph` component** | *Planned (Phase 2+)* | 2D Cartesian coordinate plane with plots. |
| **`geometry` component** | *Planned (Phase 2+)* | Geometric shapes, vectors, and angle diagrams. |
| **`table` component** | *Planned (Phase 2+)* | Tabular data grid with columns and rows. |
| **`steps` container** | *Planned (Phase 2+)* | Sub-item array for individually paginated steps. |
| **`list` component** | *Planned (Phase 2+)* | Bulleted or numbered list items. |
| **`highlight` component** | *Planned (Phase 2+)* | Callout box for key formulas or emphasis. |
| **`note` component** | *Planned (Phase 2+)* | Side note or warning callout box. |
| **`summary` component** | *Planned (Phase 2+)* | End-of-chapter recap box. |

---

## Phase 1 JSON Schema (Implemented)

### Top-Level Document Structure

```json
{
  "chapter": {
    "title": "Chapter 1: Kinematics",
    "subtitle": "Motion in One Dimension"
  },
  "pages": [
    {
      "items": [
        {
          "type": "question",
          "number": 1,
          "question": [
            {
              "type": "text",
              "content": "A particle moves along a straight line with constant acceleration $a = 2\\text{ m/s}^2$. If initial velocity $v_0 = 5\\text{ m/s}$, find velocity at $t = 3\\text{ s}$."
            }
          ],
          "solution": [
            {
              "type": "text",
              "content": "Using the velocity equation $v = v_0 + at$:"
            },
            {
              "type": "text",
              "content": "$v = 5 + (2)(3) = 11\\text{ m/s}$."
            }
          ]
        }
      ]
    }
  ]
}
```

### Property Details (Phase 1)

#### 1. `chapter` (Object, Required)
- **`title`** (`string`, Required): The primary title for the chapter notes. Must be a non-null string.
- **`subtitle`** (`string`, Required): The secondary subtitle for the chapter notes. Must be a non-null string.

#### 2. `pages` (Array, Required)
- An array of page objects. Note: An empty array (`"pages": []`) is accepted as structurally valid schema.
- Each page object contains:
  - **`items`** (`array`, Required): Array of item objects rendered on that page.

#### 3. `items[]` (Array of Objects, Required)
In Phase 1, each item must be of type `"question"`.
- **`type`** (`string`, Required): Must equal `"question"`.
- **`number`** (`number` or `string`, Required): Problem identifier badge number (e.g. `1`, `2`, `"1a"`).
- **`question`** (`array`, Required): Array of content elements defining the question prompt. In Phase 1, items in this array must be objects with `type: "text"` and a `content` string.
- **`solution`** (`array`, Required): Array of content elements defining the solution steps. In Phase 1, items in this array must be objects with `type: "text"` and a `content` string.

#### 4. Content Elements (`text`)
- **`type`** (`string`, Required): Must equal `"text"`.
- **`content`** (`string`, Required): Plain text or LaTeX-embedded text string.

---

## Full Target Schema (Future Phases)

In subsequent phases, Notes Mode will support additional rich content components inside item arrays and standalone page elements. The full target specification includes:

```json
{
  "chapter": {
    "title": "Chapter 3: Electromagnetism & Geometry",
    "subtitle": "Advanced Vector Analysis"
  },
  "pages": [
    {
      "items": [
        {
          "type": "question",
          "number": 1,
          "question": [
            {
              "type": "text",
              "content": "Calculate the electric field at point $P$."
            },
            {
              "type": "coordinate_graph",
              "config": {
                "xRange": [-5, 5],
                "yRange": [-5, 5],
                "points": [{ "x": 2, "y": 3, "label": "P" }],
                "lines": [{ "from": [0,0], "to": [2,3], "label": "\\vec{r}" }]
              }
            }
          ],
          "solution": [
            {
              "type": "equation",
              "latex": "E = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q}{r^2}"
            },
            {
              "type": "steps",
              "items": [
                {
                  "type": "text",
                  "content": "Step 1: Compute magnitude $r = \\sqrt{2^2 + 3^2} = \\sqrt{13}$."
                },
                {
                  "type": "text",
                  "content": "Step 2: Substitute $r$ into Coulomb's Law."
                }
              ]
            },
            {
              "type": "highlight",
              "content": "Final Result: $E = 6.92 \\times 10^3 \\text{ N/C}$"
            }
          ]
        },
        {
          "type": "summary",
          "title": "Key Concept Summary",
          "content": [
            { "type": "text", "content": "Electric field vectors point away from positive charges." }
          ]
        }
      ]
    }
  ]
}
```

### Future Element Types Delineation

- **`equation`** (`type: "equation"`): Dedicated display LaTeX block. Contains property `latex` (`string`).
- **`coordinate_graph`** (`type: "coordinate_graph"`): 2D Cartesian plane configuration. Contains `config` object with range boundaries, vectors, points, and functions.
- **`geometry`** (`type: "geometry"`): Geometric shape specification (triangles, polygons, circles, angles) for diagram rendering.
- **`table`** (`type: "table"`): Data table with `headers` (`array` of strings) and `rows` (2D array of string cells).
- **`steps`** (`type: "steps"`): Array container (`items: []`) allowing solution steps to be measured and paginated individually across page boundaries.
- **`list`** (`type: "list"`): List container with `ordered` (`boolean`) and `items` (`array` of content elements).
- **`highlight`** (`type: "highlight"`): Accent-colored key formula or callout box.
- **`note`** (`type: "note"`): Side remark or warning callout box.
- **`summary`** (`type: "summary"`): End-of-section recap card with title and content elements.
