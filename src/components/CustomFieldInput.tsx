import type { CustomField } from '../api/servicesApi';

interface Props {
  field: CustomField;
  value: string;
  onChange: (id: string, value: string) => void;
}

export function CustomFieldInput({ field, value, onChange }: Props) {
  const handleChange = (val: string) => onChange(field.id, val);

  switch (field.type) {
    case 'dropdown':
      return (
        <select
          required={field.required}
          value={value}
          onChange={e => handleChange(e.target.value)}
        >
          <option value="" disabled>Select {field.label}</option>
          {field.options?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    case 'textarea':
      return (
        <textarea
          required={field.required}
          value={value}
          onChange={e => handleChange(e.target.value)}
          placeholder={`Enter ${field.label}`}
        />
      );
    case 'boolean':
      return (
        <div className="bs-custom-boolean">
          <input
            type="checkbox"
            checked={value === 'true'}
            onChange={e => handleChange(e.target.checked ? 'true' : 'false')}
          />
          <span>Yes / Confirmed</span>
        </div>
      );
    default:
      return (
        <input
          type={field.type === 'number' ? 'number' : 'text'}
          required={field.required}
          value={value}
          onChange={e => handleChange(e.target.value)}
          placeholder={`Enter ${field.label}`}
        />
      );
  }
}
