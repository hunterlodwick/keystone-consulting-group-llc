export function SpamGuardFields({ token }: { token: string }) {
  return (
    <>
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px',
        top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
        <label>Company website<input type="text" name="company_website"
          tabIndex={-1} autoComplete="off" /></label>
      </div>
      <input type="hidden" name="_sg_t" value={token} />
    </>
  );
}
