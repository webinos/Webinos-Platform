package org.webinos.impl.mediacontent;

public final class SelectStatement {
  private String statement;
  private String[] args;
  
  public SelectStatement(String statement, String[] args) {
    this.statement = statement;
    this.args = args;
  }

  public String getStatement() {
    return statement;
  }
  
  public String[] getArgs() {
    return args;
  }
}

