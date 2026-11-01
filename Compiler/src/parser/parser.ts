import type {Token,MatchNode,TeamNode,InningsNode,OverNode,DeliveryNode} from '../ast/nodes';
import {HowzatError} from '../errors/compilerError';
export class Parser {
  private i=0; constructor(private tokens:Token[]){}
  private get t(){return this.tokens[this.i]!;} private at(type:string){return this.t.type===type;} private take(){return this.tokens[this.i++]!;}
  private expect(type:string,msg?:string){if(!this.at(type))throw new HowzatError(msg??`Expected ${type}, found '${this.t.value||this.t.type}'`,this.t.line,this.t.column,'Syntax');return this.take();}
  private name(){const t=this.t;if(t.type!=='IDENT'&&t.type!=='STRING')throw new HowzatError('Expected a team or player name',t.line,t.column,'Syntax');this.take();return t.value;}
  parse():MatchNode {
    this.expect('MATCH','Program must start with MATCH');const name=this.expect('STRING','Expected match name in quotes').value;this.expect('{');
    this.expect('FORMAT');let format=this.take().value.toUpperCase();if(!['CUSTOM','T20','ODI'].includes(format))throw new HowzatError('FORMAT must be CUSTOM, T20 or ODI',this.t.line,this.t.column,'Syntax');
    let oversLimit=format==='T20'?20:format==='ODI'?50:0;let maxOversPerBowler=format==='T20'?4:format==='ODI'?10:0;
    if(this.at('OVERS')){this.take();oversLimit=Number(this.expect('NUMBER').value);}
    if(this.at('MAX_OVERS_PER_BOWLER')){this.take();maxOversPerBowler=Number(this.expect('NUMBER').value);}
    if(format==='CUSTOM'&&oversLimit===0)throw new HowzatError('CUSTOM format requires OVERS n',this.t.line,this.t.column,'Syntax');
    if(maxOversPerBowler===0)maxOversPerBowler=Math.ceil(oversLimit/5);
    const teams:TeamNode[]=[];while(this.at('TEAM'))teams.push(this.parseTeam());
    const innings=this.parseInnings();this.expect('}','Expected closing brace for MATCH');this.expect('EOF','Unexpected content after MATCH block');
    return {name,format,oversLimit,maxOversPerBowler,teams,innings};
  }
  private parseTeam():TeamNode {this.expect('TEAM');const name=this.name();this.expect('{');this.expect('PLAYERS');const playerCount=Number(this.expect('NUMBER').value);this.expect('ROSTER');this.expect('{');const roster:string[]=[];while(!this.at('}')){roster.push(this.expect('STRING','Roster entries must be quoted player names').value);}this.expect('}');this.expect('}');return{name,playerCount,roster};}
  private parseInnings():InningsNode {const start=this.expect('INNINGS');const battingTeam=this.name();this.expect('{');this.expect('AGAINST');const bowlingTeam=this.name();this.expect('OPENERS');const first=this.expect('STRING').value;this.expect(',');const second=this.expect('STRING').value;const overs:OverNode[]=[];while(this.at('OVER'))overs.push(this.parseOver());this.expect('}');return{battingTeam,bowlingTeam,openers:[first,second],overs,line:start.line};}
  private parseOver():OverNode {const start=this.expect('OVER');const number=Number(this.expect('NUMBER').value);this.expect('{');this.expect('BOWLER');const bowler=this.expect('STRING','Bowler name must be quoted').value;const deliveries:DeliveryNode[]=[];
    while(!this.at('}')){const t=this.t; if(t.type==='NUMBER'){this.take();const n=Number(t.value);if(n<0||n>6)throw new HowzatError('Delivery runs must be between 0 and 6',t.line,t.column,'Syntax');deliveries.push({kind:n===0?'DOT':'RUN',runs:n,line:t.line});}
      else if(t.type==='DOT'){this.take();deliveries.push({kind:'DOT',runs:0,line:t.line});}
      else if(t.type==='IDENT'&&t.value.toLowerCase()==='wd'){this.take();deliveries.push({kind:'WIDE',runs:1,line:t.line});}
      else if(t.type==='IDENT'&&t.value.toLowerCase()==='nb'){this.take();deliveries.push({kind:'NO_BALL',runs:1,line:t.line});}
      else if(t.type==='IDENT'&&t.value.toUpperCase()==='W'){this.take();deliveries.push({kind:'WICKET',runs:0,line:t.line});}
      else throw new HowzatError(`Invalid delivery '${t.value}'. Use 0-6, W, wd or nb`,t.line,t.column,'Syntax');
    }this.expect('}');if(deliveries.length===0)throw new HowzatError(`OVER ${number} must contain at least one delivery`,start.line,1,'Syntax');return{number,bowler,deliveries,line:start.line};}
}
