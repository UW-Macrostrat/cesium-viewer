import h from "@macrostrat/hyper";
import { FormGroup, NumericInput, Switch } from "@blueprintjs/core";
import { DisplayQuality } from "./actions";

const GlobeSettings = ({ dispatch, state }) => {
  return h("div.globe-settings", [
    h(
      FormGroup,
      { label: "Vertical exaggeration" },
      h(NumericInput, {
        value: state.verticalExaggeration,
        onValueChange(value) {
          dispatch({ type: "set-exaggeration", value });
        },
      })
    ),
    h(
      FormGroup,
      { label: "High quality" },
      h(Switch, {
        checked: state.displayQuality == DisplayQuality.High,
        onChange(evt) {
          const value =
            state.displayQuality == DisplayQuality.High
              ? DisplayQuality.Low
              : DisplayQuality.High;
          dispatch({ type: "set-display-quality", value });
        },
      })
    ),
    h(
      FormGroup,
      { label: "Show inspector" },
      h(Switch, {
        checked: state.showInspector,
        onChange(evt) {
          dispatch({ type: "set-show-inspector", value: !state.showInspector });
        },
      })
    ),
  ]);
};

export { GlobeSettings };
