import React from 'react';

function SkuInput({ value, onChange, allSkus }) {
  const [editingSku, setEditingSku] = React.useState(value);
  const [previousSku, setPreviousSku] = React.useState(value);

  // keep local value in sync with prop value
  React.useEffect(() => {
    setEditingSku(value);
    setPreviousSku(value);
  }, [value]);

  return (
    <input
      className="border-none w-full focus-visible:outline-none focus-visible:ring-0 focus-visible:border-none rounded-none p-3 pr-0 m-0"
      value={editingSku}
      onFocus={() => setPreviousSku(editingSku)}
      onChange={(e) => setEditingSku(e.target.value)}
      onBlur={() => {
        const newSku = editingSku.trim();
        if (allSkus.includes(newSku)) {
          // Revert on duplicate
          setEditingSku(previousSku);
          return;
        }
        onChange(newSku); // Only update parent if valid
      }}
    />
  );
}

export default SkuInput;
