import styles from './create.module.css'

export type RequirementRow = { id: number }

export function RequirementEditor({
  label,
  name,
  rows,
  onAdd,
  onRemove,
}: {
  label: string
  name: 'skill' | 'equipment'
  rows: RequirementRow[]
  onAdd: () => void
  onRemove: (id: number) => void
}) {
  const itemName = name === 'skill' ? 'skill' : 'equipment'

  return (
    <fieldset className={styles.requirementGroup}>
      <legend>{label}</legend>
      {rows.map((row, index) => (
        <div
          className={`${styles.requirementRow} ${rows.length === 1 ? styles.singleRequirementRow : ''}`}
          key={row.id}
        >
          <label>
            <span className={styles.visuallyHidden}>
              {itemName} {index + 1}
            </span>
            <input
              maxLength={100}
              name={`${name}Name`}
              placeholder={itemName}
            />
          </label>
          <label>
            <span className={styles.visuallyHidden}>
              {itemName} {index + 1} level
            </span>
            <select defaultValue="" name={`${name}Level`}>
              <option value="">Select level</option>
              <option value="REQUIRED">Required</option>
              <option value="RECOMMENDED">Recommended</option>
            </select>
          </label>
          {rows.length > 1 ? (
            <button
              aria-label={`Remove ${itemName} ${index + 1}`}
              className={styles.removeRequirement}
              onClick={() => onRemove(row.id)}
              type="button"
            >
              Remove
            </button>
          ) : null}
        </div>
      ))}
      {rows.length < 3 ? (
        <button className={styles.addRequirement} onClick={onAdd} type="button">
          + Add {itemName}
        </button>
      ) : null}
    </fieldset>
  )
}
