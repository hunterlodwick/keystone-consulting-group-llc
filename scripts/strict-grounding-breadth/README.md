# Approved evidence in this release

`npm run widget:package` validates all 20 existing source integrity pins, the 242 public approvals and 12 fixed excerpts, then produces the 254-passage server artifact. It never refreshes an approval or pin. `npm run build` runs that gate first.

Runtime imports only the packaged artifact and its digest. It never reads the source tree, review metadata, raw index, or candidate output. Drift requires explicit review before changing pins. No catalog or debug endpoint is shipped.

The extraction scripts remain here because three are themselves integrity-pinned inputs. They are review tooling, not release commands; their private QA inputs and runners are intentionally absent. Do not run them to manufacture approval. Release regression tests use public questions and synthetic request fixtures without writing transcripts or QA reports.
