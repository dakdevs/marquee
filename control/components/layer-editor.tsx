import { useState, useEffect } from "react";
import { Save, ChevronDown } from "lucide-react";
import { Switch } from "@base-ui-components/react/switch";
import { Select } from "@base-ui-components/react/select";
import type { OverlayLayer, TemplateType } from "../../types.ts";
import {
  templateDefaults,
  templateLabels,
  allTemplateTypes,
} from "../lib/template-config.ts";
import { FormField } from "./ui/form-field.tsx";

export function LayerEditor({
  layer,
  onSave,
  onPreviewChange,
}: {
  layer: OverlayLayer | null;
  onSave: (updates: {
    label: string;
    template: TemplateType;
    props: Record<string, string>;
  }) => void;
  onPreviewChange: (template: string, props: Record<string, string>) => void;
}) {
  const [label, setLabel] = useState("");
  const [template, setTemplate] = useState<TemplateType>("lower-third");
  const [props, setProps] = useState<Record<string, string>>({});

  useEffect(() => {
    if (layer) {
      setLabel(layer.label);
      setTemplate(layer.template);
      setProps({ ...layer.props });
      onPreviewChange(layer.template, layer.props);
    }
  }, [layer?.id]);

  useEffect(() => {
    onPreviewChange(template, props);
  }, [template, props]);

  if (!layer) {
    return (
      <div className="flex items-center justify-center py-8 text-[#27272a] text-xs">
        Select a layer to edit
      </div>
    );
  }

  const fields = templateDefaults[template] ?? [];

  function handleTemplateChange(newTemplate: TemplateType) {
    setTemplate(newTemplate);
    const newProps: Record<string, string> = {};
    for (const f of templateDefaults[newTemplate] ?? []) {
      newProps[f.key] = f.placeholder;
    }
    setProps(newProps);
  }

  function handlePropChange(key: string, value: string) {
    setProps((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    onSave({ label, template, props });
  }

  return (
    <section className="px-5 py-3.5 min-h-0">
      <div>
        <div className="flex gap-2.5 mb-2.5">
          <div className="flex-1">
            <FormField label="Label">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Layer name…"
                spellCheck={false}
                autoComplete="off"
                className="w-full px-2.5 py-[7px] bg-[#111113] border border-[#27272a] rounded text-[#fafafa] font-mono text-xs outline-none transition-[border-color] duration-150 ease-in-out focus:border-[#3f3f46] focus-visible:border-[#818cf8] focus-visible:shadow-[0_0_0_2px_rgba(129,140,248,0.25)] focus-visible:outline-none"
              />
            </FormField>
          </div>
          <div className="flex-1">
            <FormField label="Template">
              <Select.Root
                value={template}
                onValueChange={(val) =>
                  handleTemplateChange(val as TemplateType)
                }
              >
                <Select.Trigger className="flex items-center justify-between gap-1.5 w-full px-2.5 py-[7px] bg-[#111113] border border-[#27272a] rounded text-[#fafafa] font-mono text-xs cursor-pointer outline-none transition-[border-color] duration-150 ease-in-out focus:border-[#3f3f46] focus-visible:border-[#818cf8] focus-visible:shadow-[0_0_0_2px_rgba(129,140,248,0.25)] focus-visible:outline-none">
                  <Select.Value />
                  <Select.Icon className="flex items-center text-[#52525b]">
                    <ChevronDown size={12} aria-hidden="true" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Positioner className="select-positioner">
                    <Select.Popup className="select-popup">
                      {allTemplateTypes.map((t) => (
                        <Select.Item key={t} value={t} className="select-item">
                          <Select.ItemText>{templateLabels[t]}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Popup>
                  </Select.Positioner>
                </Select.Portal>
              </Select.Root>
            </FormField>
          </div>
        </div>
        <div className="flex flex-col gap-2 mb-3">
          {fields.map((field) => (
            <FormField
              key={field.key}
              label={field.label}
              toggle={field.type === "toggle"}
            >
              {field.type === "toggle" ? (
                <Switch.Root
                  className="relative w-8 h-[18px] shrink-0 bg-[#1e1e22] rounded-[9px] border border-[#27272a] cursor-pointer transition-[background,border-color] duration-150 ease-in-out focus-visible:border-[#818cf8] focus-visible:shadow-[0_0_0_2px_rgba(129,140,248,0.25)] focus-visible:outline-none toggle-switch"
                  checked={props[field.key] === "on"}
                  onCheckedChange={(checked) =>
                    handlePropChange(field.key, checked ? "on" : "off")
                  }
                >
                  <Switch.Thumb className="absolute w-3 h-3 left-0.5 top-0.5 bg-[#52525b] rounded-full transition-[transform,background] duration-150 ease-in-out toggle-thumb" />
                </Switch.Root>
              ) : (
                <input
                  type="text"
                  value={props[field.key] ?? ""}
                  onChange={(e) => handlePropChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full px-2.5 py-[7px] bg-[#111113] border border-[#27272a] rounded text-[#fafafa] font-mono text-xs outline-none transition-[border-color] duration-150 ease-in-out focus:border-[#3f3f46] focus-visible:border-[#818cf8] focus-visible:shadow-[0_0_0_2px_rgba(129,140,248,0.25)] focus-visible:outline-none"
                />
              )}
            </FormField>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button
            className="inline-flex items-center justify-center gap-[5px] px-5 py-2 font-mono text-[11px] font-semibold border-none rounded-[5px] cursor-pointer transition-[background,opacity,transform] duration-150 ease-in-out active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_rgba(129,140,248,0.25)] bg-white text-[#09090b] hover:opacity-90"
            onClick={handleSave}
          >
            <Save size={14} aria-hidden="true" />
            Save
          </button>
        </div>
      </div>
    </section>
  );
}
