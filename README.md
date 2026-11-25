# Howzat-cricket-compiler

A TypeScript compiler and React playground for a cricket-themed domain-specific language (DSL). It parses match declarations, validates team/player/bowler configuration and basic cricket constraints, simulates an innings, and produces a scorecard, IR and readable JavaScript target output.

## Requirements
- Node.js 20 or newer recommended
- npm 10+

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:5173.

## Validate
```bash
npm run typecheck
npm test
npm run build
```

`npm run compiler:typecheck` and `npm run frontend:typecheck` can also be run
individually. `npm test` runs the compiler regression tests against the supplied
examples, including the intentionally invalid over.

## Language example
```text
MATCH "India vs Australia" {
  FORMAT CUSTOM
  OVERS 3
  MAX_OVERS_PER_BOWLER 2

  TEAM India {
    PLAYERS 5
    ROSTER {
      "Rohit"
      "Gill"
      "Virat"
      "Hardik"
      "Jadeja"
    }
  }

  TEAM Australia {
    PLAYERS 5
    ROSTER {
      "Starc"
      "Cummins"
      "Maxwell"
      "Head"
      "Smith"
    }
  }

  INNINGS India {
    AGAINST Australia
    OPENERS "Rohit", "Gill"
    OVER 1 {
      BOWLER "Starc"
      1 4 W . 6 wd 2
    }
    OVER 2 {
      BOWLER "Maxwell"
      1 1 2 4 0 6
    }
    OVER 3 {
      BOWLER "Starc"
      0 1 1 2 4 1
    }
  }
}
```

## Delivery notation in v2
- `0` or `.`: dot ball, legal
- `1` through `6`: batter runs, legal
- `W`: simplified bowled wicket of the striker, legal
- `wd`: one wide penalty, illegal
- `nb`: one no-ball penalty, illegal

An over must contain six legal deliveries unless it is the final, incomplete over of an innings. Wides and no-balls do not increment the legal-ball count. Odd completed batter runs swap ends. A wicket brings in the next batter at the striker's end. Six legal balls swap ends at over completion. The bowler is specified once per over.

## Grammar overview
```text
match       := MATCH STRING '{' FORMAT format [OVERS NUMBER] [MAX_OVERS_PER_BOWLER NUMBER] team team innings '}'
team        := TEAM IDENT '{' PLAYERS NUMBER ROSTER '{' STRING+ '}' '}'
innings     := INNINGS IDENT '{' AGAINST IDENT OPENERS STRING ',' STRING over+ '}'
over        := OVER NUMBER '{' BOWLER STRING delivery+ '}'
delivery    := NUMBER(0..6) | '.' | 'W' | 'wd' | 'nb'
```

## Architecture
- `Compiler/`: standalone TypeScript compiler and its examples/tests.
- `Compiler/src/lexer`, `parser`, and `ast`: tokenization, recursive-descent
  parsing, and typed syntax tree.
- `Compiler/src/cricket`: match validation, cricket rules, execution, and result
  types.
- `Compiler/src/ir` and `Compiler/src/codegen`: intermediate representation and
  readable JavaScript generation.
- `Compiler/src/index.ts`: public `compile(source)` entry point and exported
  result types.
- `Frontend/`: React/Vite playground, static assets, components, and styles.
- `Frontend/src/main.tsx` and `Frontend/src/App.tsx`: browser entry point and
  compiler workbench.
- `Frontend/src/components`: scorecard, ball timeline, and compiler output
  panels.

The frontend invokes the compiler directly in the browser through the
`@compiler` TypeScript/Vite alias, which resolves to `Compiler/src`. There is no
separate compiler server or HTTP API. The compiler remains in its own directory;
Vite bundles its public entry point with the frontend. The frontend uses React,
TypeScript, Vite, Monaco Editor, and Lucide icons. Its styling is existing plain
CSS; Tailwind and PostCSS are not used in this repository.

## Root Commands
- `npm install`: install the shared frontend/build/test dependencies.
- `npm run dev`: start the frontend development server at
  `http://localhost:5173`.
- `npm run build`: create the production frontend in `Frontend/dist`.
- `npm run typecheck`: check compiler and frontend TypeScript projects.
- `npm test`: run compiler tests against valid and invalid existing examples.


## Research Paper & Technical Report

A detailed technical report formatted according to IEEE conference standards is available in this repository:
- **Paper Title**: *HowzatLang: Design and Implementation of a Domain-Specific Language and Real-Time Interactive Compiler Studio for Cricket Match Simulation*
- **PDF Document**: [`Howzat_Cricket_Compiler_IEEE_Report.pdf`](./Howzat_Cricket_Compiler_IEEE_Report.pdf)
- **HTML Source**: [`report/ieee_report.html`](./report/ieee_report.html)

## Contributors & Team Members

- **Mahender Parihar** ([@Mahi0606](https://github.com/Mahi0606))
  - Project architecture, repository design, and initial compiler scaffolding.
- **Siddhartha Shukla**
  - Compiler pipeline design and implementation (Lexer, Recursive-Descent Parser, AST, and Intermediate Representation).
  - Cricket rule validation and match simulation engine (strike rotation, bowler restrictions, legal delivery tracking, and extras).
  - Frontend compiler workbench (React, Monaco Editor syntax highlighting, interactive scorecard, and ball timeline).
- **Aryan Jangde**
  - Cricket match simulation engine, discrete delivery state machine, and batsman strike rotation dynamics.
- **Sugat Athawale**
  - Compiler regression test suite design, edge-case coverage (all-out scenarios, incomplete overs), and documentation.
- **Sanskar Singh**
  - Intermediate representation (IR) opcode design, JavaScript target code generation, and IDE compiler inspection panels.
