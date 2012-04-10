///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 08:39:53
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using System.Collections;
using System.Collections.Generic;
using policyDB;
using policyDB.FactoryClasses;
using policyDB.HelperClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.RelationClasses
{
	/// <summary>Implements the static Relations variant for the entity: Condition. </summary>
	public partial class ConditionRelations : DecisionNodeRelations
	{
		/// <summary>CTor</summary>
		public ConditionRelations()
		{
		}

		/// <summary>Gets all relations of the ConditionEntity as a list of IEntityRelation objects.</summary>
		/// <returns>a list of IEntityRelation objects</returns>
		public override List<IEntityRelation> GetAllRelations()
		{
			List<IEntityRelation> toReturn = base.GetAllRelations();



			return toReturn;
		}

		#region Class Property Declarations

		/// <summary>Returns a new IEntityRelation object, between ConditionEntity and AttributeValueEntity over the 1:n relation they have, using the relation between the fields:
		/// Condition.Id - AttributeValue.AttributeMatchId
		/// </summary>
		public override IEntityRelation AttributeValueEntityUsingAttributeMatchId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "AttributeValue" , true);
				relation.AddEntityFieldPair(ConditionFields.Id, AttributeValueFields.AttributeMatchId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("ConditionEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("AttributeValueEntity", false);
				return relation;
			}
		}

		/// <summary>Returns a new IEntityRelation object, between ConditionEntity and DecisionNodeEntity over the 1:n relation they have, using the relation between the fields:
		/// Condition.Id - DecisionNode.ParentId
		/// </summary>
		public override IEntityRelation DecisionNodeEntityUsingParentId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "Children" , true);
				relation.AddEntityFieldPair(ConditionFields.Id, DecisionNodeFields.ParentId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("ConditionEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("DecisionNodeEntity", false);
				return relation;
			}
		}

		/// <summary>Returns a new IEntityRelation object, between ConditionEntity and RuleEntity over the 1:n relation they have, using the relation between the fields:
		/// Condition.Id - Rule.ConditionId
		/// </summary>
		public override IEntityRelation RuleEntityUsingConditionId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "Rule" , true);
				relation.AddEntityFieldPair(ConditionFields.Id, RuleFields.ConditionId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("ConditionEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("RuleEntity", false);
				return relation;
			}
		}

		/// <summary>Returns a new IEntityRelation object, between ConditionEntity and TargetConditionEntity over the 1:n relation they have, using the relation between the fields:
		/// Condition.Id - TargetCondition.ConditionId
		/// </summary>
		public override IEntityRelation TargetConditionEntityUsingConditionId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "TargetCondition" , true);
				relation.AddEntityFieldPair(ConditionFields.Id, TargetConditionFields.ConditionId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("ConditionEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("TargetConditionEntity", false);
				return relation;
			}
		}


		/// <summary>Returns a new IEntityRelation object, between ConditionEntity and AttributeEntity over the m:1 relation they have, using the relation between the fields:
		/// Condition.AttributeId - Attribute.Id
		/// </summary>
		public override IEntityRelation AttributeEntityUsingAttributeId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "Attribute", false);
				relation.AddEntityFieldPair(AttributeFields.Id, ConditionFields.AttributeId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("AttributeEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("ConditionEntity", true);
				return relation;
			}
		}
		/// <summary>Returns a new IEntityRelation object, between ConditionEntity and DecisionNodeEntity over the m:1 relation they have, using the relation between the fields:
		/// Condition.ParentId - DecisionNode.Id
		/// </summary>
		public override IEntityRelation DecisionNodeEntityUsingIdParentId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "Parent", false);
				relation.AddEntityFieldPair(DecisionNodeFields.Id, ConditionFields.ParentId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("DecisionNodeEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("ConditionEntity", true);
				return relation;
			}
		}

		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public override IEntityRelation GetSubTypeRelation(string subTypeEntityName) { return null; }
		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public override IEntityRelation GetSuperTypeRelation() { return null;}

		#endregion

		#region Included Code

		#endregion
	}
}
