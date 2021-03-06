import React from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import "whatwg-fetch";
import {
  SelectField,
  Spinner,
  Option,
} from "@contentful/forma-36-react-components";
import { init } from "contentful-ui-extensions-sdk";
import "@contentful/forma-36-react-components/dist/styles.css";
import "./index.css";

class App extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired,
  };

  detachExternalChangeHandler = null;

  constructor(props) {
    super(props);
    this.state = {
      value: props.sdk.field.getValue(),
      error: false,
      hasLoaded: false,
      jobPosts: [],
    };
  }

  componentDidMount() {
    this.props.sdk.window.startAutoResizer();

    // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    this.detachExternalChangeHandler = this.props.sdk.field.onValueChanged(
      this.onExternalChangep
    );

    // fetch("https://jsonplaceholder.typicode.com/users")
    fetch("https://api.lever.co/v0/postings/cloud-nine?mode=json")
      .then((res) => res.json())
      .then(
        (jobPosts) => {
          this.setState({
            hasLoaded: true,
            jobPosts,
          });
        },
        (error) => {
          this.setState({
            hasLoaded: true,
            error: error,
          });
        }
      );
  }

  componentWillUnmount() {
    if (this.detachExternalChangeHandler) {
      this.detachExternalChangeHandler();
    }
  }

  onExternalChange = (value) => {
    this.setState({ value });
  };

  onChange = (e) => {
    const value = e.currentTarget.value;
    this.setState({ value });
    if (value) {
      this.props.sdk.field.setValue(value);
    } else {
      this.props.sdk.field.removeValue();
    }
  };

  render() {
    if (!this.state.hasLoaded) {
      return <Spinner />;
    }

    return (
      <SelectField
        id="jobPosts"
        name="jobPosts"
        labelText="Select job post"
        helpText="Get job posts from the Lever API"
        value={this.state.value}
        onChange={this.onChange}
      >
        <Option value="">Pick a Lever Job Post</Option>
        {this.state.jobPosts.map((jobPost) => {
          return (
            <Option key={jobPost.id} value={jobPost.id.toString()}>
              {jobPost.text}
            </Option>
          );
        })}
      </SelectField>
    );
  }
}

init((sdk) => {
  ReactDOM.render(<App sdk={sdk} />, document.getElementById("root"));
});

// Enabling hot reload
if (module.hot) {
  module.hot.accept();
}
