# HowzatLang v2.0 — Language and compiler architecture

## Design goal
HowzatLang is an educational cricket-match DSL. The source program declares two teams, their custom roster sizes, an innings, opening batters, the bowler for each over, and a sequence of ball events. The compiler tokenizes and parses the source, validates match configuration and cricket constraints, simulates the innings, and exposes a scorecard, IR, and generated JavaScript for inspection.

## Language grammar (simplified EBNF)
```ebnf
program       = "MATCH", string, "{", formatDecl, [oversDecl], [bowlerLimitDecl], teamDecl, teamDecl, inningsDecl, "}" ;
formatDecl    = "FORMAT", ("CUSTOM" | "T20" | "ODI") ;
oversDecl     = "OVERS", integer ;
bowlerLimitDecl = "MAX_OVERS_PER_BOWLER", integer ;
teamDecl      = "TEAM", identifier, "{", "PLAYERS", integer, "ROSTER", "{", string, {string}, "}", "}" ;
inningsDecl   = "INNINGS", identifier, "{", "AGAINST", identifier, "OPENERS", string, ",", string, overDecl, {overDecl}, "}" ;
overDecl      = "OVER", integer, "{", "BOWLER", string, delivery, {delivery}, "}" ;
delivery      = integer(0..6) | "." | "W" | "wd" | "nb" ;
```

## Compiler pipeline
1. **Lexer** (`lexer/lexer.ts`): converts characters into typed tokens with line and column information.
2. **Parser** (`parser/parser.ts`): recursive-descent parser validates structure and constructs a typed AST.
3. **Semantic / cricket validation** (`cricket/validator.ts`): validates team count, roster count, unique players, opening batters, bowler membership, over order, six legal balls, maximum overs and bowler restrictions.
4. **Match execution** (`cricket/engine.ts`): processes each delivery and maintains the innings state, striker, non-striker, batter statistics, bowler statistics, extras and fall of wickets.
5. **IR generation** (`ir/generator.ts`): emits domain-level match instructions.
6. **Code generation** (`codegen/javascript.ts`): emits readable JavaScript representing the validated match input and a summary routine.
7. **Presentation** (`frontend`): Monaco editor, compilation log, scorecard, ball timeline, tokens, AST, IR and generated JavaScript.

## State transition rules in v2
- The first name in `OPENERS` begins as striker; the second begins as non-striker.
- Numeric runs are completed batter runs. An odd number swaps the ends; an even number does not.
- `W` is the v2 shorthand for a bowled dismissal of the striker. The next not-yet-used batter in roster order enters at the striker's end. The wicket is credited to the bowler.
- `wd` adds one wide extra and is not a legal delivery. It does not count as a ball faced and does not change strike in this simplified notation.
- `nb` adds one no-ball extra and is not a legal delivery. It counts as a ball faced in this prototype, but no batter runs or running extras are represented.
- After six legal deliveries, the two batters exchange ends.
- The innings ends when `playerCount - 1` wickets fall or the over limit is completed.
- The bowler is assigned once per over. Consecutive overs by the same bowler are rejected. A configurable maximum overs per bowler is enforced.

## Why the compiler has both IR and JavaScript output
The IR expresses cricket-domain operations such as `BAT_RUNS`, `ADD_WIDE`, `WICKET`, and `COMPLETE_OVER`. JavaScript output demonstrates a target-code generation stage. For safety and deterministic scoring, the application executes the validated AST through the TypeScript match engine rather than evaluating arbitrary generated JavaScript.

## Important scope boundary
The implementation is a simplified educational engine, not a complete Laws of Cricket implementation. It does not yet model byes, leg-byes, multiple runs on wides/no-balls, no-ball bat runs, run-outs, caught dismissals, crossing, retired hurt, substitutions, penalty runs, free hits, strike changes on dismissal-specific events, innings two/chase targets, or a match result. `W` deliberately means bowled in this version so bowler wicket attribution is unambiguous. These should be added as explicit DSL constructs rather than guessed from a bare `W` token.
