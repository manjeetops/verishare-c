import React from "react";
import { Switch, Route } from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Singup";
import Upload from "./container/Upload";
import DocDetails from "./pages/DocDetails";
import Users from "./components/Users"
import TransferHistory from "./components/TransferHistory"

const Router = () => (
  <Switch>
    <Route exact path="/login" component={Login}></Route>
    <Route exact path="/documents" component={Upload}></Route>
    <Route exact path="/doc/:id" component={DocDetails}></Route>
    <Route exact path="/signup" component={Signup}></Route>
    <Route exact path="/users" component={Users}></Route>
    <Route exact path="/transfers" component={TransferHistory}></Route>
  </Switch>
);

export default Router;
