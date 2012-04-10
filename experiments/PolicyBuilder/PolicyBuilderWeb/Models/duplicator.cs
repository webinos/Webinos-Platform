using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using policyDB.EntityClasses;
using policyDB.CollectionClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;
using policyDB.HelperClasses;
using PolicyBuilder.Controllers;


namespace PolicyBuilder.Models
{
    public class duplicator
    {
        static public void MarkEntityDirty(EntityBase entity)
        {
            IEntityFields fields = entity.Fields;

            foreach (IEntityField fld in fields)
                fld.IsChanged = true;

            fields.IsDirty = true;
            entity.IsDirty = true;
        }

        static public PolicyEntity dupPolicy(int id)
        {
            PolicyEntity original = new PolicyEntity(id);
            
            PolicyEntity copy = new PolicyEntity(id);
            duplicator.MarkEntityDirty(copy);
            copy.IsNew = true;
            copy.IsLibrary = false;
            copy.Uid = Guid.NewGuid();

            foreach (RuleEntity rule in original.Rule)
            {
                RuleEntity newRule = dupRule(rule);
                newRule.Policy = copy;
            }

            copy.Target = dupTarget(original.Target);

            copy.Save(true);

            return copy;
        }

        static public RuleEntity dupRule(RuleEntity rule)
        {
            RuleEntity copy = new RuleEntity(rule.Id);
            duplicator.MarkEntityDirty(copy);
            copy.IsNew = true;

            copy.Condition = dupCondition(rule.Condition);

            return copy;
        }

        static public TargetEntity dupTarget(TargetEntity original)
        {
            TargetEntity copy = new TargetEntity(original.Id);
            duplicator.MarkEntityDirty(copy);
            copy.IsNew = true;

            foreach (TargetConditionEntity tce in original.TargetCondition)
            {
                TargetConditionEntity tceCopy = new TargetConditionEntity();
                tceCopy.DecisionNode = dupCondition(tce.DecisionNode);
                tceCopy.Target = copy;
            }

            return copy;
        }

        static public DecisionNodeEntity dupCondition(DecisionNodeEntity original)
        {
            DecisionNodeEntity copy = new DecisionNodeEntity(original.Id);
            duplicator.MarkEntityDirty(copy);
            copy.IsNew = true;

            foreach (AttributeValueEntity ave in original.AttributeValue)
            {
                AttributeValueEntity aveCopy = dupAttributeValue(ave);
                aveCopy.AttributeMatch = copy;
            }

            foreach (DecisionNodeEntity dce in original.Children)
            {
                DecisionNodeEntity dceNew = dupCondition(dce);
                dceNew.Parent = copy;
            }

            return copy;
        }

        static public AttributeValueEntity dupAttributeValue(AttributeValueEntity original)
        {
            AttributeValueEntity copy = new AttributeValueEntity(original.Id);
            duplicator.MarkEntityDirty(copy);
            copy.IsNew = true;

            return copy;
        }
    }
}
