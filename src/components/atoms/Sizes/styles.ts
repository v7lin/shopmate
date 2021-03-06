import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    "& button": {
      marginRight: 8,
      marginBottom: 8
    }
  }
}));

export default useStyles;
