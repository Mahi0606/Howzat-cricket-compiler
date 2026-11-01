import {useEffect,useMemo,useRef,useState} from 'react';
import Editor from '@monaco-editor/react';
import {Activity,BookOpen,CheckCircle2,ChevronDown,Code2,Copy,FileCode2,Play,RefreshCw,Trophy,Workflow,AlertTriangle,Terminal,Braces} from 'lucide-react';
import {compile} from '@compiler';
import type {CompilationResult} from '@compiler/cricket/types';
import Scorecard from './components/Scorecard';
import BallTimeline from './components/BallTimeline';
import {AstPanel,IrPanel,JavaScriptPanel,TokenPanel} from './components/CompilerPanels';

type Tab='scorecard'|'overs'|'tokens'|'ast'|'ir'|'javascript';
const starter=`MATCH "India vs Australia — Practice Match" {
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
}`;
const examples=[
 {name:'Practice match · 5 players',code:starter},
 {name:'Simple over · wides and wicket',code:starter.slice(0,starter.indexOf('    OVER 2 {'))+'  }\n}'},
 {name:'11-player T20 setup',code:starter.replace('FORMAT CUSTOM\n  OVERS 3\n  MAX_OVERS_PER_BOWLER 2','FORMAT T20').replaceAll('PLAYERS 5','PLAYERS 11').replace('"Jadeja"','"Jadeja"\n      "Ashwin"\n      "Bumrah"\n      "Surya"\n      "KL Rahul"\n      "Shami"').replace('"Smith"','"Smith"\n      "Marsh"\n      "Zampa"\n      "Stoinis"\n      "Carey"\n      "Hazlewood"')}
];
export default function App(){const [source,setSource]=useState(starter);const [compiledSource,setCompiledSource]=useState(starter);const [result,setResult]=useState<CompilationResult|null>(()=>compile(starter));const [tab,setTab]=useState<Tab>('scorecard');const [example,setExample]=useState('0');const [showExamples,setShowExamples]=useState(false);const [copied,setCopied]=useState(false);const editorHost=useRef<HTMLDivElement>(null);const [editorInstance,setEditorInstance]=useState<{layout:()=>void}|null>(null);
 const run=()=>{const next=compile(source);setResult(next);setCompiledSource(source);setTab(next.success?'scorecard':'tokens');};
 const loadExample=(i:string)=>{setExample(i);setSource(examples[Number(i)]!.code);setShowExamples(false);};
 const tabs:[Tab,string,typeof Trophy][]=[['scorecard','Scorecard',Trophy],['overs','Ball timeline',Activity],['tokens','Tokens',Braces],['ast','AST',Workflow],['ir','IR',Terminal],['javascript','JavaScript',Code2]];
 const score=result?.scorecard;const summary=useMemo(()=>result?.success?result.scorecard:null,[result]);
 const copy=async(text:string)=>{await navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),1200);};
 useEffect(()=>{const host=editorHost.current;if(!host||!editorInstance)return;const observer=new ResizeObserver(()=>editorInstance.layout());observer.observe(host);editorInstance.layout();return()=>observer.disconnect();},[editorInstance]);
 return <div className="app-shell"><header className="topbar"><div className="brand"><div className="brand-mark"><Trophy size={20}/></div><div><b>HOWZAT<span>LANG</span></b><small>CRICKET COMPILER STUDIO</small></div></div><div className="top-center"><span className="status-pill"><i/> COMPILER READY</span><span className="version">V2.0.0</span></div><div className="top-actions"><button className="icon-btn" title="Open intermediate representation" aria-label="Open intermediate representation" onClick={()=>setTab('ir')}><BookOpen size={17}/></button><button className="run-btn" onClick={run}><Play size={15} fill="currentColor"/> Compile & Run</button></div></header>
 <main className="workspace"><aside className="left-rail"><div className="rail-label">WORKSPACE</div><button className="rail-item active"><FileCode2 size={17}/><span>match.howzat</span></button><div className="rail-divider"/><div className="rail-label">COMPILER FLOW</div>{[['01','Lexical analysis'],['02','Syntax analysis'],['03','Cricket validation'],['04','Match simulation'],['05','Scorecard output']].map(([n,label],i)=><div className="flow-item" key={n}><span>{n}</span><div><b>{label}</b><small>{result?.success?'Complete':'Waiting'}</small></div>{result?.success&&<CheckCircle2 size={14}/>}</div>)}<div className="rail-bottom"><div className="avatar">HL</div><div><b>HowzatLang</b><small>Domain-specific language</small></div></div></aside>
 <section className="editor-area"><div className="editor-toolbar"><div className="file-tab"><span className="file-dot"/> match.howzat {source!==compiledSource&&<span className="unsaved" title="Source changed since last compile">Modified</span>}</div><div className="editor-tools"><div className="example-wrap"><button className="tool-btn" aria-expanded={showExamples} aria-haspopup="true" onClick={()=>setShowExamples(v=>!v)}>Examples <ChevronDown size={14}/></button>{showExamples&&<div className="dropdown" role="group" aria-label="Match examples">{examples.map((e,i)=><button key={e.name} onClick={()=>loadExample(String(i))}>{e.name}</button>)}</div>}</div><button className="tool-btn" onClick={()=>setSource(starter)}><RefreshCw size={14}/> Reset</button></div></div>
 <div className="editor-caption"><span>HOWZAT SOURCE</span><span>CRICKET DSL · UTF-8</span></div><div className="editor-container" ref={editorHost}><Editor height="100%" language="howzat" theme="howzat-light" onMount={(editor)=>setEditorInstance(editor)}
 beforeMount={(monaco)=>{
monaco.languages.register({id:'howzat'});monaco.languages.setMonarchTokensProvider('howzat',{tokenizer:{root:[[/\b(MATCH|FORMAT|CUSTOM|T20|ODI|OVERS|MAX_OVERS_PER_BOWLER|TEAM|PLAYERS|ROSTER|INNINGS|AGAINST|OPENERS|OVER|BOWLER)\b/,'keyword'],[/\b(wd|nb)\b/,'type'],[/\bW\b/,'keyword'],[/\b[0-6]\b/,'number'],[/"([^"\\]|\\.)*"/,'string'],[/\/\/.*$/,'comment'],[/[{}(),]/,'delimiter']]}});monaco.editor.defineTheme('howzat-light',{base:'vs',inherit:true,rules:[{token:'keyword',foreground:'2459A6',fontStyle:'bold'},{token:'type',foreground:'A45C12',fontStyle:'bold'},{token:'number',foreground:'287348'},{token:'string',foreground:'0F766E'},{token:'comment',foreground:'6B7582',fontStyle:'italic'}],colors:{'editor.background':'#FBFCFE','editor.foreground':'#202B38','editorLineNumber.foreground':'#8793A2','editorLineNumber.activeForeground':'#34445A','editorCursor.foreground':'#285DB3','editor.selectionBackground':'#DDE9FA','editor.lineHighlightBackground':'#F3F6FA','editorIndentGuide.background1':'#E3E8EE'}});
}} value={source} onChange={v=>setSource(v??'')} options={{fontSize:13.5,lineHeight:23,fontFamily:'JetBrains Mono, Menlo, monospace',minimap:{enabled:false},scrollBeyondLastLine:false,automaticLayout:true,wordWrap:'on',padding:{top:18,bottom:18},lineNumbers:'on',renderLineHighlight:'all',overviewRulerBorder:false,hideCursorInOverviewRuler:true,bracketPairColorization:{enabled:true}}}/></div>
 <div className="editor-footer"><span><span className="green-dot"/> {source.split('\n').length} lines</span><span>HowzatLang v2.0</span><button onClick={()=>copy(source)}><Copy size={13}/>{copied?'Copied':'Copy source'}</button></div>
 <div className="console-area"><div className="console-head"><div><Terminal size={15}/> COMPILATION LOG</div><span>{result?.success?'0 ERRORS':`${result?.errors.length??0} ERRORS`}</span></div>{result?.success?<div className="success-log"><CheckCircle2 size={15}/><span>Compilation successful. Cricket rules validated and match simulation completed.</span><b>{summary?.totalRuns}/{summary?.wickets}</b></div>:<div className="error-log"><AlertTriangle size={15}/><div>{result?.errors.map((e,i)=><p key={i}><b>{e.phase} error · Line {e.line}:{e.column}</b> {e.message}</p>)??'Click Compile & Run to start.'}</div></div>}</div>
 </section>
 <section className="results-area"><div className="results-header"><div><span className="eyebrow">MATCH OUTPUT</span><h2>Match centre</h2></div><div className={`compile-state ${result?.success?'ok':'bad'}`}>{result?.success?<CheckCircle2 size={14}/>:<AlertTriangle size={14}/>} {result?.success?'VALID MATCH':'NEEDS ATTENTION'}</div></div>
 {result?.success&&score?<><div className="match-banner"><div className="banner-top"><span>LIVE SCORECARD</span><span>{result.format} · {result.matchName}</span></div><div className="score-banner-main"><div><small>{score.battingTeam}</small><strong>{score.totalRuns}<i>/{score.wickets}</i></strong></div><div className="banner-divider"/><div><small>OVERS</small><strong>{score.overs}</strong></div><div><small>RUN RATE</small><strong>{score.runRate.toFixed(2)}</strong></div></div><div className="banner-bottom"><span><i/> {score.completed?'INNINGS COMPLETE':'IN PROGRESS'}</span><span>{score.completionReason}</span></div></div>
 <div className="tabs" role="group" aria-label="Match output views">{tabs.map(([id,label,Icon])=><button key={id} type="button" aria-pressed={tab===id} className={tab===id?'selected':''} onClick={()=>setTab(id)}><Icon size={14}/>{label}</button>)}</div><div className="result-content" role="region" aria-label={`${tab} output`}>{tab==='scorecard'&&<Scorecard data={score}/>}{tab==='overs'&&<BallTimeline data={score}/>}{tab==='tokens'&&<TokenPanel result={result}/>}{tab==='ast'&&<AstPanel result={result}/>}{tab==='ir'&&<IrPanel result={result}/>}{tab==='javascript'&&<JavaScriptPanel result={result} onCopy={()=>copy(result.generatedCode??'')}/>}</div></>:<div className="empty-state"><div className="empty-icon"><AlertTriangle size={25}/></div><h3>Match not compiled</h3><p>Fix the source errors and run the compiler to see the scorecard, ball timeline and compiler internals.</p><button className="run-btn" onClick={run}><Play size={14}/> Try again</button></div>}
 <footer className="right-footer"><span>HOWZATLANG ENGINE</span><span>Built for the love of cricket <Trophy size={12}/></span></footer></section></main></div>;
}
