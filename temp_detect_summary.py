import json 
from pathlib import Path 
j=json.loads(Path('graphify-out/.graphify_detect.json').read_text()) 
print(f'Corpus: {j[" "total_files]} files ú ~{j[total_words]} words') 
files=j['files'] 
for k in ['code','document','paper','image','video']:\ ; echo     if files.get(k): ; echo         print(f'  {k}: {len(files[k])} files') ; echo if j['skipped_sensitive'] : ; echo     print(f'Skipped {len(j[skipped_sensitive])} sensitive file(s)') ; python temp_detect_summary.py ; del temp_detect_summary.py
