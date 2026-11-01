import {tokenize} from './lexer/lexer';
import {Parser} from './parser/parser';
import {validateMatch} from './cricket/validator';
import {simulate} from './cricket/engine';
import {generateIR} from './ir/generator';
import {generateJavaScript} from './codegen/javascript';
import {HowzatError} from './errors/compilerError';
import type {CompilationResult} from './cricket/types';
export function compile(source:string):CompilationResult {
 try {const tokens=tokenize(source);const ast=new Parser(tokens).parse();validateMatch(ast);const scorecard=simulate(ast);return{success:true,matchName:ast.name,format:ast.format,tokens,ast,ir:generateIR(ast),generatedCode:generateJavaScript(ast),scorecard,errors:[]};}
 catch(error){const e=error instanceof HowzatError?error:new HowzatError(error instanceof Error?error.message:'Unknown compiler error');return{success:false,errors:[e.toJSON()]};}
}
export * from './cricket/types';
