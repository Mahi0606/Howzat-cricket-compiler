import type { Token } from '../ast/nodes';
import { HowzatError } from '../errors/compilerError';
const keywords = new Set(['MATCH','FORMAT','CUSTOM','T20','ODI','OVERS','MAX_OVERS_PER_BOWLER','TEAM','PLAYERS','ROSTER','INNINGS','AGAINST','OPENERS','OVER','BOWLER']);
export function tokenize(source:string):Token[] {
  const out:Token[]=[]; let i=0,line=1,col=1;
  const push=(type:string,value:string,l=line,c=col)=>out.push({type,value,line:l,column:c});
  const advance=(s:string)=>{for(const ch of s){if(ch==='\n'){line++;col=1;}else col++;}i+=s.length;};
  while(i<source.length){const ch=source[i]!; if(/\s/.test(ch)){advance(ch);continue;} if(ch==='/'&&source[i+1]==='/'){let s='';while(i<source.length&&source[i]!=='\n')s+=source[i++];col+=s.length;continue;}
    const l=line,c=col;
    if(ch==='"'){advance(ch);let value='';while(i<source.length&&source[i]!=='"'){if(source[i]==='\\'&&i+1<source.length){advance(source[i]!);value+=source[i]!;advance(source[i]!);}else{value+=source[i]!;advance(source[i]!);}}if(i>=source.length)throw new HowzatError('Unterminated string literal',l,c,'Lexical');advance('"');push('STRING',value,l,c);continue;}
    if(/[0-9]/.test(ch)){let s='';while(i<source.length&&/[0-9]/.test(source[i]!)){s+=source[i]!;advance(source[i]!);}push('NUMBER',s,l,c);continue;}
    if(/[A-Za-z_]/.test(ch)){let s='';while(i<source.length&&/[A-Za-z0-9_]/.test(source[i]!)){s+=source[i]!;advance(source[i]!);}const upper=s.toUpperCase();push(keywords.has(upper)?upper:'IDENT',s,l,c);continue;}
    if(ch==='.' ){advance(ch);push('DOT','.',l,c);continue;}
    if('{}(),'.includes(ch)){advance(ch);push(ch,ch,l,c);continue;}
    throw new HowzatError(`Unexpected character '${ch}'`,l,c,'Lexical');
  }
  out.push({type:'EOF',value:'',line,column:col}); return out;
}
