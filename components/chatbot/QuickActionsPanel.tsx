"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  FileText,
  Search,
  MessageSquare,
  Upload,
  Brain,
  CheckSquare,
  Plus,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lock,
  Zap,
  Star
} from 'lucide-react';
import { QuickActionsProps } from '@/types/chatbot';
import { cn } from '@/lib/utils';

const iconMap = {
  'complaint_register': FileText,
  'complaint_status': Search,
  'feedback_submit': MessageSquare,
  'document_upload': Upload,
  'content_generate': Brain,
  'audit_questions': CheckSquare,
  'general_inquiry': Plus,
  'greeting': Sparkles,
  'complaint': FileText,
  'search': Search,
  'feedback': MessageSquare,
  'upload': Upload,
  'brain': Brain,
  'audit': CheckSquare,
  'help': Plus,
  'default': Plus
};

export function QuickActionsPanel({
  actions,
  onActionClick,
  loading = false,
  userAuthenticated = false,
  className
}: QuickActionsProps & { className?: string }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getIcon = (intent: string) => {
    const IconComponent = iconMap[intent as keyof typeof iconMap] || iconMap.default;
    return IconComponent;
  };

  const getIntentColor = (intent: string) => {
    const colors = {
      'complaint_register': 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100',
      'complaint_status': 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100',
      'feedback_submit': 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100',
      'document_upload': 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100',
      'content_generate': 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100',
      'audit_questions': 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
      'general_inquiry': 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100',
      'greeting': 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100',
      'help': 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100'
    };
    return colors[intent as keyof typeof colors] || colors.help;
  };

  // Group actions by category
  const groupedActions = React.useMemo(() => {
    const groups: Record<string, typeof actions> = {
      'Complaints': [],
      'Content & Documents': [],
      'General': []
    };

    actions.forEach(action => {
      if (action.intent_type.includes('complaint')) {
        groups['Complaints'].push(action);
      } else if (action.intent_type.includes('content') || action.intent_type.includes('document') || action.intent_type.includes('audit')) {
        groups['Content & Documents'].push(action);
      } else {
        groups['General'].push(action);
      }
    });

    return groups;
  }, [actions]);

  // Filter actions based on authentication
  const getFilteredActions = (categoryActions: typeof actions) => {
    return categoryActions.filter(action =>
      !action.requires_auth || userAuthenticated
    );
  };

  const renderActionCard = (action: typeof actions[0]) => {
    const Icon = getIcon(action.intent_type || action.icon);
    const colorClasses = getIntentColor(action.intent_type);
    const isDisabled = action.requires_auth && !userAuthenticated;

    return (
      <Card
        key={action.id}
        className={cn(
          "transition-all duration-200 cursor-pointer hover:shadow-md",
          colorClasses,
          isDisabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !isDisabled && !loading && onActionClick(action)}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-white/50 flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-sm truncate">
                  {action.title}
                </h4>
                {action.requires_auth && (
                  <Lock className="h-3 w-3 text-gray-400" />
                )}
              </div>

              <p className="text-xs opacity-75 line-clamp-2 mb-2">
                {action.description}
              </p>

              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {action.button_text}
                </Badge>
                {action.intent_type.includes('generate') && (
                  <Zap className="h-3 w-3 text-orange-500" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCategorySection = (category: string, categoryActions: typeof actions) => {
    const filteredActions = getFilteredActions(categoryActions);

    if (filteredActions.length === 0) return null;

    const isSelected = selectedCategory === category;

    return (
      <div key={category} className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-between p-2 h-auto"
          onClick={() => setSelectedCategory(isSelected ? null : category)}
        >
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{category}</span>
            <Badge variant="secondary" className="text-xs">
              {filteredActions.length}
            </Badge>
          </div>
          {isSelected ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        <Collapsible open={isSelected}>
          <CollapsibleContent className="space-y-2">
            {filteredActions.map(renderActionCard)}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-500">Loading quick actions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!actions || actions.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="text-center text-sm text-gray-500">
            No quick actions available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                Quick Actions
                <Badge variant="outline" className="text-xs">
                  {actions.filter(a => !a.requires_auth || userAuthenticated).length}
                </Badge>
              </CardTitle>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-4 pt-0 max-h-96 overflow-y-auto chatbot-scrollbar-always chatbot-smooth-scroll">
            {/* Authentication status */}
            {!userAuthenticated && actions.some(a => a.requires_auth) && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-amber-800">
                    Some actions require authentication
                  </span>
                </div>
              </div>
            )}

            {/* Category sections */}
            <div className="space-y-4">
              {Object.entries(groupedActions).map(([category, categoryActions]) =>
                renderCategorySection(category, categoryActions)
              )}
            </div>

            {/* Popular actions shortcut */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Popular Actions</span>
                <Star className="h-4 w-4 text-yellow-500" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {actions
                  .filter(a => ['complaint_register', 'complaint_status'].includes(a.intent_type))
                  .filter(a => !a.requires_auth || userAuthenticated)
                  .slice(0, 2)
                  .map(action => {
                    const Icon = getIcon(action.intent_type);
                    return (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        className="h-auto p-3 flex flex-col items-center space-y-1"
                        onClick={() => onActionClick(action)}
                        disabled={loading}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs text-center">{action.title}</span>
                      </Button>
                    );
                  })}
              </div>
            </div>

            {/* Footer info */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Click any action to get started</span>
                <div className="flex items-center space-x-1">
                  <Zap className="h-3 w-3" />
                  <span>AI-powered</span>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default QuickActionsPanel;
