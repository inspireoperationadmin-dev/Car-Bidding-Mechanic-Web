import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { RotateCcw, Home, AlertTriangle, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { withTranslation, type WithTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface Props extends WithTranslation {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
}

class ErrorBoundaryBase extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
    });
    window.location.reload();
  };

  handleCopy = () => {
    if (!this.state.error) return;
    const textToCopy = `${this.state.error.toString()}\n\nStack:\n${
      this.state.errorInfo?.componentStack || this.state.error.stack || ""
    }`;
    navigator.clipboard.writeText(textToCopy);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    const { t } = this.props;
    const { hasError, error, errorInfo, copied, showDetails } = this.state;

    if (hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-background via-background to-muted/20 relative overflow-hidden">
          {/* Ambient Glow Orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 dark:bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <Card className="max-w-lg w-full border-border/80 shadow-2xl bg-card/85 backdrop-blur-xl relative z-10 rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Top decorative gradient bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-amber-500 to-primary" />

            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Icon & Badge Header */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shadow-inner">
                    <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
                  </span>
                </div>

                <Badge
                  variant="outline"
                  className="border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/5 text-xs font-semibold px-2.5 py-0.5"
                >
                  Application Boundary Caught Exception
                </Badge>

                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {t("common.errorBoundary.title", "Something went wrong")}
                </h1>

                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
                  {t(
                    "common.errorBoundary.description",
                    "An unexpected issue occurred while loading this view. Your session data remains secure."
                  )}
                </p>
              </div>

              {/* Error Details Accordion */}
              {error && (
                <div className="rounded-xl border border-border/80 bg-muted/30 overflow-hidden text-left">
                  <button
                    type="button"
                    onClick={this.toggleDetails}
                    className="w-full flex items-center justify-between p-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-mono truncate max-w-[280px] sm:max-w-xs text-red-600 dark:text-red-400 font-semibold">
                      {error.name}: {error.message}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground ml-2 shrink-0">
                      {showDetails ? (
                        <>
                          Hide Details <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          Show Details <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </span>
                  </button>

                  {showDetails && (
                    <div className="p-3 border-t border-border/60 bg-black/40 text-xs font-mono space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Stack Trace</span>
                        <button
                          type="button"
                          onClick={this.handleCopy}
                          className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Log</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="text-[11px] text-red-400/90 whitespace-pre-wrap break-all max-h-40 overflow-y-auto leading-relaxed">
                        {error.toString()}
                        {"\n"}
                        {errorInfo?.componentStack || error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Button
                  onClick={this.handleReset}
                  className="w-full sm:flex-1 h-10 gap-2 font-semibold shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t("common.errorBoundary.reload", "Reload Page")}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/dashboard")}
                  className="w-full sm:flex-1 h-10 gap-2 font-semibold"
                >
                  <Home className="w-4 h-4" />
                  <span>{t("common.errorBoundary.home", "Go Home")}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryBase);
