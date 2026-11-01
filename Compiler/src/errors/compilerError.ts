export class HowzatError extends Error {
  constructor(message: string, public line = 1, public column = 1, public phase: 'Lexical'|'Syntax'|'Semantic'|'Cricket Rule'|'Runtime' = 'Syntax') { super(message); this.name = 'HowzatError'; }
  toJSON() { return { message:this.message, line:this.line, column:this.column, phase:this.phase }; }
}
